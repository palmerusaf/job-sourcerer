import logo from '/wxt.svg';
import { JobSelectType, jobStatusEmojis, jobTable } from '@/utils/db/schema';
import { ColumnDef } from '@tanstack/react-table';
import { JobModal } from '../job-modal';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { db } from '@/utils/db/db';
import { inArray } from 'drizzle-orm';
import { useQueryClient } from '@tanstack/react-query';
import { CommentsDrawer } from './comments-drawer';
import { Checkbox } from '../ui/checkbox';
import { DeleteButton } from '../job-tracker-Page/columns';
import { AsyncButton } from '../async-button';

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
    }) => <Status id={id} status={status} />,
  },
  {
    header: 'Actions',
    cell: ({ row: { original } }) => (
      <ActionMenu
        items={[
          <JobModal key={'job'} data={original} />,
          <CommentsDrawer key={'comment'} id={original.id} />,
          <UnarchiveButton key={'archive'} ids={[original.id]} />,
          <DeleteButton key={'del'} ids={[original.id]} />,
        ]}
      />
    ),
  },
];

function Status({ id, status }: Pick<JobSelectType, 'id' | 'status'>) {
  return <div className='text-lg gap-2 flex'>{jobStatusEmojis[status]}</div>;
}

export function UnarchiveButton({ ids }: { ids: number[] }) {
  const qc = useQueryClient();
  return (
    <AsyncButton
      loadingText={`Unarchiving ${ids.length} Job${ids.length > 1 ? 's' : ''}...`}
      variant={'secondary'}
      onClickAsync={async () => {
        await db
          .update(jobTable)
          .set({ archived: false })
          .where(inArray(jobTable.id, ids));
        qc.invalidateQueries({ queryKey: ['savedJobs'] });
        qc.invalidateQueries({ queryKey: ['archivedJobs'] });
      }}
    >
      Unarchive
    </AsyncButton>
  );
}

function ActionMenu({ items }: { items: React.ReactNode[] }) {
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
