import { db } from './db';
import { calculateCosineSimilarity } from '@/utils/ats-matching';
import { jobTable, rawResumes, matchingAlgoSettingsTable } from './schema';
import { eq } from 'drizzle-orm';
import { autoGhostJobs } from '@/components/ghosted-settings-page';

export async function getSavedJobs() {
  await autoGhostJobs();
  const [{ enableSbert, keywordStrategy }] = await db
    .select()
    .from(matchingAlgoSettingsTable)
    .limit(1);
  const res = await db
    .select()
    .from(jobTable)
    .where(eq(jobTable.archived, false))
    .leftJoin(rawResumes, eq(jobTable.resumeId, rawResumes.id));
  const scoredResults = await Promise.all(
    res.map(async (i) => {
      return {
        ...i.jobs,
        score: !i?.raw_resumes
          ? -1
          : await calculateCosineSimilarity(
            i.jobs.description,
            i.raw_resumes.rawText
          ),
      };
    })
  );
  return scoredResults.sort((a, b) => b.score - a.score);
}
