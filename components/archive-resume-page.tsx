import { db } from '@/utils/db/db';
import { resumes } from '@/utils/db/schema';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';

export function ArchiveResumePage() {
  const { data, isPending } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => await db.select().from(resumes),
  });
  const qc = useQueryClient();

  if (isPending)
    return (
      <div className='flex justify-center items-center h-full'>
        <div className='text-xl animate-pulse text-slate-500'>Loading...</div>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className='flex justify-center items-center h-full'>
        <div className='text-xl text-slate-500'>No Data available</div>
      </div>
    );

  return (
    <div className='pb-6 max-h-full'>
      <div className='grid overflow-y-auto grid-cols-2 gap-2 mx-auto max-w-2xl'>
        <span className='text-xl font-bold'>Resume Name</span>
        <span></span>
        {data.map(({ id, name, archived: prevArchivedStatus }) => {
          return (
            <>
              <span className='my-auto text-lg'>{name}</span>
              <AsyncButton
                variant={prevArchivedStatus ? 'outline' : 'secondary'}
                onClickAsync={async () => {
                  await db
                    .update(resumes)
                    .set({ archived: !prevArchivedStatus })
                    .where(eq(resumes.id, id));
                  await qc.invalidateQueries({
                    queryKey: ['savedJobs'],
                    exact: false,
                  });
                  await qc.invalidateQueries({
                    queryKey: ['resumes'],
                  });
                }}
              >
                {prevArchivedStatus ? 'Unarchive' : 'Archive'}
              </AsyncButton>
            </>
          );
        })}
      </div>
    </div>
  );
}
