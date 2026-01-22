import logo from '/wxt.svg';
import {
  appliedJobsTable,
  JobSelectType,
  jobStatus,
  jobStatusEmojis,
  jobStatusHistoryTable,
  jobTable,
} from '@/utils/db/schema';
import { ColumnDef } from '@tanstack/react-table';
import { JobModal } from '../job-modal';
import { Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { db } from '@/utils/db/db';
import { inArray } from 'drizzle-orm';
import { useQueryClient } from '@tanstack/react-query';
import { ResumeMatchesModal } from './resume-matches-modal';
import { CommentsDrawer } from './comments-drawer';
import { Checkbox } from '../ui/checkbox';
import { AsyncButton } from '../async-button';
import { removeTrackedJob } from '@/utils/storage/trackedJobs';

export const columns: ColumnDef<JobSelectType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'companyLogoUrl',
    header: '',
    cell: ({
      row: {
        original: { companyLogoUrl },
      },
    }) => {
      const imgUrl = !companyLogoUrl?.length ? logo : companyLogoUrl;
      return <img className='ml-2 w-7 h-7' src={imgUrl} />;
    },
  },
  {
    accessorKey: 'companyName',
    header: 'Company',
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const title = row.getValue('title') as string;

      return (
        <div className='w-[16ch] overflow-hidden overflow-ellipsis text-blue-700'>
          <a href={row.original.link} target='_blank' rel='noopener noreferrer'>
            {title}
          </a>
        </div>
      );
    },
  },
  {
    cell: ({
      row: {
        original: { location },
      },
    }) => (
      <div className='w-[16ch] overflow-hidden overflow-ellipsis'>
        {location}
      </div>
    ),
    header: 'Location',
  },
  {
    accessorKey: 'employmentType',
    header: 'Employment',
  },
  {
    accessorKey: 'payrate',
    header: 'Pay',
    cell: ({
      row: {
        original: { payrate, payType },
      },
    }) => <PayRate payrate={payrate} payType={payType} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({
      row: {
        original: { status, id },
      },
    }) => (
      <EditStatus
        key={id}
        ids={[id]}
        label={
          <>
            {jobStatusEmojis[status]}
            <Pencil className='size-4 my-auto ' />
          </>
        }
      />
    ),
  },
  {
    header: 'Resume',
    cell: ({ row: { original } }) => <ResumeMatchesModal jobData={original} />,
  },
  {
    header: 'Actions',
    cell: ({ row: { original } }) => (
      <ActionMenu
        key={original.id}
        items={[
          <JobModal key={'job'} data={original} />,
          <CommentsDrawer key={'comment'} id={original.id} />,
          <ArchiveButton key={'archive'} ids={[original.id]} />,
          <DeleteButton key={'del'} ids={[original.id]} />,
        ]}
      />
    ),
  },
];

export function EditStatus({
  label,
  ids,
}: {
  ids: number[];
  label?: React.ReactNode;
}) {
  const qc = useQueryClient();

  return (
    <Popover>
      <PopoverTrigger className='cursor-pointer'>
        <div className='text-lg gap-2 flex'>{label}</div>
      </PopoverTrigger>
      <PopoverContent className='grid gap-4'>
        {jobStatus
          .filter((el) => {
            if (el === 'search result') return false;
            if (el === 'recently added') return false;
            return true;
          })
          .map((status) => {
            return (
              <AsyncButton
                loadingText={`Updating ${ids.length} Job${ids.length > 1 ? 's' : ''
                  }...`}
                key={status}
                onClickAsync={async () => {
                  updateStatus({ ids, status: status });
                  qc.invalidateQueries({ queryKey: ['savedJobs'] });
                }}
                className='capitalize cursor-pointer'
              >
                {jobStatusEmojis[status]} {status}
              </AsyncButton>
            );
          })}
      </PopoverContent>
    </Popover>
  );
}

export async function updateStatus({
  ids,
  status,
}: Pick<JobSelectType, 'status'> & { ids: number[] }) {
  await db.update(jobTable).set({ status }).where(inArray(jobTable.id, ids));
  const preAppStatuses: (typeof status)[] = [
    'search result',
    'interested',
    'not interested',
    'recently added',
  ];
  if (preAppStatuses.includes(status)) {
    await db
      .delete(appliedJobsTable)
      .where(inArray(appliedJobsTable.jobId, ids));
  } else {
    await db
      .insert(appliedJobsTable)
      .values(ids.map((jobId) => ({ jobId })))
      .onConflictDoNothing();
  }

  // Track changes in job history.
  const historyEntries = ids.map((jobId) => ({
    jobId,
    status,
    changedAt: new Date(),
  }));

  await db.insert(jobStatusHistoryTable).values(historyEntries);
}

export function DeleteButton({ ids }: { ids: number[] }) {
  const qc = useQueryClient();
  return (
    <AsyncButton
      loadingText={`Deleting ${ids.length} Job${ids.length > 1 ? 's' : ''}...`}
      onClickAsync={async () => {
        // Get jobs to be deleted (Local storage)
        const jobs = await db
          .select({ jobIdFromSite: jobTable.jobIdFromSite })
          .from(jobTable)
          .where(inArray(jobTable.id, ids));

        // Remove each from tracked storage
        for (const job of jobs) {
          if (job.jobIdFromSite) {
            await removeTrackedJob(job.jobIdFromSite);
          }
        }
        await db.delete(jobTable).where(inArray(jobTable.id, ids));
        qc.invalidateQueries({ queryKey: ['savedJobs'] });
      }}
      variant={'destructive'}
    >
      Delete
    </AsyncButton>
  );
}

export function ArchiveButton({ ids }: { ids: number[] }) {
  const qc = useQueryClient();
  return (
    <AsyncButton
      variant={'secondary'}
      loadingText={`Archiving ${ids.length} Job${ids.length > 1 ? 's' : ''}...`}
      onClickAsync={async () => {
        await db
          .update(jobTable)
          .set({ archived: true })
          .where(inArray(jobTable.id, ids));
        qc.invalidateQueries({ queryKey: ['savedJobs'] });
      }}
    >
      Archive
    </AsyncButton>
  );
}

export function ActionMenu({ items }: { items: React.ReactNode[] }) {
  return (
    <Popover>
      <PopoverTrigger className='cursor-pointer'>
        <div className="p-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 py-1">
          View
        </div>
      </PopoverTrigger>
      <PopoverContent className='grid gap-4  max-w-fit'>{items}</PopoverContent>
    </Popover>
  );
}
