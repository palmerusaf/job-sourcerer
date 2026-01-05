import { eq } from 'drizzle-orm';
import { addTrackedJob } from '../storage/trackedJobs';
import { db } from './db';
import { JobSiteNameType, jobStatusHistoryTable, jobTable } from './schema';

export async function saveJobData(jobData: typeof jobTable.$inferInsert) {
  const insertedJob = await db
    .insert(jobTable)
    .values(jobData)
    .returning({ id: jobTable.id });
  const jobId = insertedJob[0].id;
  // Keep track of initial status.
  await db.insert(jobStatusHistoryTable).values({
    jobId,
    status: jobData.status ?? 'recently added',
  });
  await addTrackedJob(`${jobData.jobIdFromSite}`); // Store id locally as well.
}

export async function alreadySaved({
  jobSite,
  jobId,
}: {
  jobSite: JobSiteNameType;
  jobId: string;
}) {
  const res = await db
    .select()
    .from(jobTable)
    .where(eq(jobTable.jobIdFromSite, `${jobSite}-${jobId}`));
  return res.length !== 0;
}
