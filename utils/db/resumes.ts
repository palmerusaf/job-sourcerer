import { db } from './db';
import { resumes, rawResumes, jobTable } from './schema';
import { eq, desc, sql } from 'drizzle-orm';

export type JsonResume = Record<string, any>;

export async function createResume(params: { name: string; json: JsonResume; userId?: string | null }) {
  const [row] = await db.insert(resumes).values({
    name: params.name,
    json: params.json,
    userId: params.userId ?? null,
  }).returning();
  return row;
}

export async function listResumes(userId?: string | null) {
  const base = db.select().from(resumes).orderBy(desc(resumes.createdAt));
  return userId ? base.where(eq(resumes.userId, userId)) : base;
}

export async function getResume(id: number) {
  const rows = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function renameResume(id: number, name: string) {
  const [row] = await db.update(resumes).set({ name }).where(eq(resumes.id, id)).returning();
  return row;
}

export async function deleteResume(id: number) {
  await db.delete(resumes).where(eq(resumes.id, id));
}

export async function addRawResume(params: {
  name: string;
  rawText: string;
  source: 'builder' | 'paste';
  jsonId: number | null;
}) {
  const [row] = await db.insert(rawResumes).values({
    name: params.name,
    rawText: params.rawText,
    source: params.source,
    jsonId: params.jsonId,
  }).returning();
  return row;
}

export async function listResumeStatusCounts() {
    return db
        .select({
            resumeId: jobTable.resumeId,
            status: jobTable.status,
            name: resumes.name,
            count: sql<number>`count(*)`,
        })
        .from(jobTable)
        .leftJoin(resumes, eq(jobTable.resumeId, resumes.id))
        .where(eq(resumes.archived, false))
        .groupBy(jobTable.resumeId, resumes.name, jobTable.status);
}
