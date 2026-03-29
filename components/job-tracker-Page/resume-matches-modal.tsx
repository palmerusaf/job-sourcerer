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
import { JobSelectType, jobTable, rawResumes } from '@/utils/db/schema';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '../ui/button';

export function ResumeMatchesModal({ jobData }: { jobData: JobSelectType }) {
    const { resumeId, description } = jobData;
    const qc = useQueryClient();
    const { data, isPending } = useQuery({
        queryKey: ['savedJobs', { resumeId, description }],
        queryFn: getData,
    });
    if (isPending) return <Loader2 className='mr-2 h-4 w-4 animate-spin' />;
    const triggerLabel =
        resumeId === null ? (
            <div className="p-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 py-1">
                Link
            </div>
        ) : (
            <span className='flex gap-2 max-w-14 cursor-pointer'>
                <ResumeScore
                    jobText={data?.find((el) => el.jsonId === resumeId)?.rawText ?? ''}
                    resumeText={description}
                />
                <Pencil className=' my-auto ' />
            </span>
        );

    return (
        <Dialog key={jobData.id}>
            <DialogTrigger>{triggerLabel}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Link Resume to Job</DialogTitle>
                    <DialogDescription>
                        {!data?.length ? 'No uploaded Resumes' : <List />}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );

    function List() {
        const _data = data
            ?.map((item) => ({
                score: calculateCosineSimilarity(item.rawText, description),
                ...item,
            }))
            .sort((a, b) => b.score - a.score);
        return (
            <>
                <div className='grid grid-cols-3 gap-2'>
                    <span className='font-bold text-xl'>Resume</span>
                    <span className='font-bold text-xl'>Match Rate</span>
                    <span></span>
                </div>
                <div className='grid grid-cols-3 gap-2  overflow-y-auto max-h-72'>
                    {data?.map(({ name, jsonId, rawText }) => {
                        return (
                            <>
                                <span className='my-auto'>{name}</span>
                                <span className='max-w-10 mx-auto'>
                                    <ResumeScore jobText={rawText} resumeText={description} />
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
    async function getData() {
        return await db.select().from(rawResumes);
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

function ResumeScore({
    jobText,
    resumeText,
}: {
    jobText: string;
    resumeText: string;
}) {
    const score = calculateCosineSimilarity(jobText, resumeText);
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
