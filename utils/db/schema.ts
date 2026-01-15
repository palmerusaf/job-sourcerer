import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

export const jobSiteNames = ['linkedin', 'handshake'] as const;

export type JobSiteNameType = (typeof jobSiteNames)[number];

export const jobStatus = [
  'recently added',
  'interested',
  'applied',
  'scheduled interview',
  'ghosted',
  'rejected',
  'not interested',
  'recieved offer',
] as const;

export type JobStatusType = (typeof jobStatus)[number];

export const statusColors: Record<JobStatusType, string> = {
  'recently added': '#60a5fa',
  interested: '#fbbf24',
  applied: '#a78bfa',
  'scheduled interview': '#34d399',
  ghosted: '#6b7280',
  rejected: '#ef4444',
  'not interested': '#f87171',
  'recieved offer': '#10b981',
};

export const jobStatusEmojis: Record<JobStatusType, string> = {
  applied: '📨', // sent application
  ghosted: '👻', // no reply
  interested: '⭐', // marked as interested
  'not interested': '👎', // declined / passed
  rejected: '❌', // got rejected
  'scheduled interview': '📅', // upcoming interview
  'recently added': '🆕', // new job entry
  'recieved offer': '🤝',
} as const;

export const employmentTypeList = [
  'Full-Time',
  'Part-Time',
  'Temporary',
  'Seasonal',
  'Contractor',
] as const;

export const payTypeList = [
  'Hourly Wage',
  'Annual Salary',
  'Monthly Stipend',
] as const;

export const jobTable = pgTable('jobs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  archived: boolean('archived').default(false).notNull(),
  datePosted: timestamp('date_posted'),
  closeOutDate: timestamp('close_out_date'),
  statusChangeDate: timestamp('status_change_date').notNull().defaultNow(),
  intern: boolean('intern').notNull(),
  companyLogoUrl: text('company_logo_url').default(''),
  employmentType:
    text('employment_type').$type<(typeof employmentTypeList)[number]>(),
  companyName: text('company_name').notNull(),
  description: text('description').notNull(),
  remote: boolean('remote').notNull(),
  jobIdFromSite: text('job_id').unique(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  payrate: integer('pay_rate'), //in USD cents
  payType: text('pay_type').$type<(typeof payTypeList)[number]>(),
  link: text('link').notNull(),
  status: text('status')
    .$type<(typeof jobStatus)[number]>()
    .notNull()
    .default('recently added'),
  resumeId: integer('resume_id').references(() => resumes.id, {
    onDelete: 'set null',
  }),
});

export const jobStatusHistoryTable = pgTable('job_status_history', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer('job_id')
    .references(() => jobTable.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').$type<(typeof jobStatus)[number]>().notNull(),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
});

export type JobHistoryType = typeof jobStatusHistoryTable.$inferSelect;

export const jobCommentsTable = pgTable('job_comments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer('job_id')
    .notNull()
    .references(() => jobTable.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const appliedJobsTable = pgTable('applied_jobs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer('job_id')
    .notNull()
    .references(() => jobTable.id, { onDelete: 'cascade' })
    .unique(),
  dateApplied: timestamp('date_applied').notNull().defaultNow(),
});

export type JobSelectType = typeof jobTable.$inferSelect;

// Manual Add Job
export type JobInsertType = typeof jobTable.$inferInsert;
export const addJobFormSchema: z.ZodType<JobInsertType> = z.object({
  link: z.string().url('Invalid URL'),
  intern: z.boolean(),
  companyName: z.string().min(1, 'Company Name Required'),
  description: z.string().min(1, 'Job Description Required'), // Job Description
  remote: z.boolean(),
  title: z.string().min(1, 'Job Title Required'), // Job Title
  location: z.string().min(1, 'Job Location Required'),
  companyLogoUrl: z.preprocess(
    // When field is empty, val == ''. Z does not recognize '' as empty therefore optional won't work.
    // Solution is to convert '' to undefined first.
    (val) => (val === '' ? undefined : val),
    z.string().url('Invalid URL').optional()
  ) as z.ZodType<string | undefined>,
  employmentType: z.enum(employmentTypeList),
  payrate: z.number().int().optional(), // PayRate, in cents
  payType: z.enum(payTypeList),
  status: z.enum(jobStatus), // Application status
});

// Resume:
const emptyToUndefined = (val: unknown) =>
  typeof val === 'string' && val.trim() === '' ? undefined : val; // Helper method to turn empty fields into undefined (to pass validation)

const ProfileSchema = z.object({
  network: z.string().optional().default(''),
  username: z.string().optional().default(''),
  url: z.string().optional().default(''),
});

const EducationSchema = z.object({
  institution: z.string().min(1, 'Required'),
  area: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().optional().default(''),
});

const WorkSchema = z.object({
  company: z.string().min(1, 'Required'),
  position: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().optional().default(''),
  summary: z.string().optional().default(''),
});

const ProjectSchema = z.object({
  name: z.string().min(1, 'Required'),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().min(1, 'Required'),
  url: z.string().min(1, 'Required'),
});

export const ResumeSchema = z.object({
  basics: z.object({
    name: z.string().min(1, 'Required'),
    label: z.string().min(1, 'Required'),
    email: z.string().min(1, 'Required'),
    phone: z.string().min(1, 'Required'),
    website: z.string().min(1, 'Required'),
    summary: z.string().optional().default(''),
    profiles: z
      .array(ProfileSchema)
      .default([{ network: '', username: '', url: '' }]),
  }),
  education: z
    .array(EducationSchema)
    .min(1)
    .default([
      {
        institution: '',
        area: '',
        startDate: '',
        endDate: '',
      },
    ]),
  work: z
    .array(WorkSchema)
    .min(1)
    .default([
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        summary: '',
      },
    ]),
  projects: z
    .array(ProjectSchema)
    .min(1)
    .default([
      {
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        url: '',
      },
    ]),
});

export const resumes = pgTable('resumes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id'), // optional owner identifier
  name: text('name').notNull(), // user-chosen label for the saved resume
  json: jsonb('json').notNull(), // full JSON Resume payload
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rawResumes = pgTable('raw_resumes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  rawText: text('raw_text').notNull(),
  source: text('source').notNull(), // "builder" | "paste"
  jsonId: integer('json_id').references(() => resumes.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const resumesRelations = relations(resumes, ({ many }) => ({
  rawResumes: many(rawResumes),
}));

export const testSchema = pgTable('testSchema', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  testField: text('test_field').notNull(),
});
