import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { db } from '@/utils/db/db';
import {
  JobWithScoreType,
  jobTable,
  rawResumes,
  matchingAlgoSettingsTable,
  resumes,
} from '@/utils/db/schema';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { calculateCosineSimilarity } from '@/utils/ats-matching';
import { Loading } from '@/entrypoints/spa/App';
import { useState, useEffect } from 'react';

export function ResumeMatchesModal({ jobData }: { jobData: JobWithScoreType }) {
  const { resumeId, description } = jobData;
  const qc = useQueryClient();
  const { data: resumeData, isPending } = useQuery({
    queryKey: ['savedJobs', { resumeId, description }],
    queryFn: async () => {
      const result = await db
        .select({
          id: rawResumes.id,
          name: rawResumes.name,
          rawText: rawResumes.rawText,
          source: rawResumes.source,
          jsonId: rawResumes.jsonId,
          createdAt: rawResumes.createdAt,
        })
        .from(rawResumes)
        .innerJoin(resumes, eq(rawResumes.jsonId, resumes.id))
        .where(eq(resumes.archived, false));
      return result;
    },
  });
  if (isPending) return <Loader2 className='mr-2 w-4 h-4 animate-spin' />;
  const triggerLabel =
    resumeId === null ? (
      <div className="p-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 py-1">
        Link
      </div>
    ) : (
      <span className='flex gap-2 cursor-pointer max-w-14'>
        <ResumeScore score={jobData.score} />
        <Pencil className='my-auto' />
      </span>
    );

  return (
    <Dialog key={jobData.id}>
      <DialogTrigger>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Resume to Job</DialogTitle>
          <DialogDescription>
            {!resumeData?.length ? 'No uploaded Resumes' : <List />}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  function List() {
    const [_data, set_Data] = useState<
      {
        id: number;
        name: string;
        rawText: string;
        source: string;
        jsonId: number | null;
        createdAt: Date;
        score: number;
      }[]
    >([]);
    // TODO: extract to function and clear this key in settings page
    const { data: algoSettingsData } = useQuery({
      queryKey: ['matchingAlgoSettings'],
      queryFn: () => db.select().from(matchingAlgoSettingsTable).limit(1),
    });
    useEffect(() => {
      if (!resumeData || !algoSettingsData) return;
      Promise.all(
        resumeData.map(async (resume) => {
          return {
            score: await calculateCosineSimilarity(
              resume.rawText,
              description,
              algoSettingsData[0].enableSbert,
              algoSettingsData[0].keywordStrategy
            ),
            ...resume,
          };
        })
      ).then((res) => set_Data(res.sort((a, b) => b.score - a.score)));
    }, [resumeData, description, algoSettingsData]);
    if (!_data.length)
      return (
        <div>
          <Loading />
        </div>
      );
    return (
      <>
        <div className='grid grid-cols-3 gap-2'>
          <span className='text-xl font-bold'>Resume</span>
          <span className='text-xl font-bold'>Match Rate</span>
          <span></span>
        </div>
        <div className='grid overflow-y-auto grid-cols-3 gap-2 max-h-72'>
          {_data?.map(({ name, jsonId, score }) => {
            return (
              <>
                <span className='my-auto'>{name}</span>
                <span className='mx-auto max-w-10'>
                  <ResumeScore score={score} />
                </span>
                {jsonId === resumeId ? (
                  <Button disabled>Linked</Button>
                ) : (
                  <AsyncButton
                    loadingText='Linking...'
                    onClickAsync={async () => {
                      await linkResume(jsonId, jobData.id, qc);
                    }}
                  >
                    Link
                  </AsyncButton>
                )}
              </>
            );
          })}
        </div>
      </>
    );
  }
}

export async function linkResume(
  jsonId: number | null,
  jobId: number,
  qc: QueryClient
) {
  await db
    .update(jobTable)
    .set({ resumeId: jsonId })
    .where(eq(jobTable.id, jobId));
  await qc.invalidateQueries({ queryKey: ['savedJobs'] });
}

function ResumeScore({ score }: { score: number }) {
  return (
    <CircularProgressbar
      styles={buildStyles({
        pathColor: 'hsl(262.1 83.3% 57.8%)',
        textColor: 'hsl(262.1 83.3% 57.8%)',
        textSize: 32,
        rotation: 0.625,
      })}
      circleRatio={0.75}
      text={`${score}%`}
      value={score}
    />
  );
}
