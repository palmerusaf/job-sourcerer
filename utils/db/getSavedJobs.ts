import { db } from './db';
import { calculateCosineSimilarity } from '@/utils/extractKeywords';
import { jobTable, rawResumes } from './schema';
import { eq } from 'drizzle-orm';

export async function getSavedJobs() {
  const res = await db
    .select()
    .from(jobTable)
    .where(eq(jobTable.archived, false))
    .leftJoin(rawResumes, eq(jobTable.resumeId, rawResumes.id));
  return res
    .map((i) => {
      return {
        ...i.jobs,
        score: !i?.raw_resumes
          ? -1
          : calculateCosineSimilarity(
            i.jobs.description,
            i.raw_resumes.rawText
          ),
      };
    })
    .sort((a, b) => b.score - a.score);
}
