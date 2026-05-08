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
      <div className='flex items-center justify-center h-full'>
        <div className='text-xl text-slate-500 animate-pulse'>Loading...</div>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-xl text-slate-500'>No Data available</div>
      </div>
    );

  return (
    <div className='max-h-full pb-6'>
      <div className='mx-auto overflow-y-auto max-w-2xl gap-2 grid grid-cols-2'>
        <span className='text-xl font-bold'>Resume Name</span>
        <span></span>
        {data.map(({ id, name, archived }) => {
          return (
            <>
              <span className='text-lg my-auto'>{name}</span>
              <AsyncButton
                variant={archived ? 'default' : 'destructive'}
                onClickAsync={async () => {
                  if (archived) {
                    await db.update(resumes).set({ archived: false }).where(eq(resumes.id, id));
                  } else {
                    await db.update(resumes).set({ archived: true }).where(eq(resumes.id, id));
                  }
                  await qc.invalidateQueries({
                    queryKey: ['savedJobs'],
                    exact: false,
                  });
                  await qc.invalidateQueries({
                    queryKey: ['resumes'],
                  });
                }}
              >
                {archived ? 'Unarchive' : 'Archive'}
              </AsyncButton>
            </>
          );
        })}
      </div>
    </div>
  );
}
