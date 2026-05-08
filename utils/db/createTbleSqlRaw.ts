export const createTbleSqlRaw = `
CREATE TABLE "jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"date_posted" timestamp,
	"close_out_date" timestamp,
	"status_change_date" timestamp DEFAULT now() NOT NULL,
	"intern" boolean NOT NULL,
	"company_logo_url" text DEFAULT '',
	"employment_type" text,
	"company_name" text NOT NULL,
	"description" text NOT NULL,
	"remote" boolean NOT NULL,
	"job_id" text,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"pay_rate" integer,
	"link" text NOT NULL,
	"status" text DEFAULT 'recently added' NOT NULL,
	CONSTRAINT "jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "testSchema" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "testSchema_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"test_field" text NOT NULL
);

CREATE TABLE "job_comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_comments" ADD CONSTRAINT "job_comments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "jobs" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;
ALTER TABLE "jobs" ADD COLUMN "pay_type" text;
CREATE TABLE "job_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_events" ADD CONSTRAINT "job_events_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "job_events" ADD CONSTRAINT "job_events_job_id_event_type_unique" UNIQUE("job_id","event_type");
CREATE TABLE "applied_jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "applied_jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"date_applied" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applied_jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
DROP TABLE "job_events" CASCADE;--> statement-breakpoint
ALTER TABLE "applied_jobs" ADD CONSTRAINT "applied_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE "raw_resumes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "raw_resumes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"raw_text" text NOT NULL,
	"source" text NOT NULL,
	"json_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resumes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text,
	"name" text NOT NULL,
	"json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "raw_resumes" ADD CONSTRAINT "raw_resumes_json_id_resumes_id_fk" FOREIGN KEY ("json_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "jobs" ADD COLUMN "resume_id" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;
CREATE TABLE "job_status_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"status" text NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_status_history" ADD CONSTRAINT "job_status_history_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "raw_resumes" DROP CONSTRAINT "raw_resumes_json_id_resumes_id_fk";
--> statement-breakpoint
ALTER TABLE "raw_resumes" ADD CONSTRAINT "raw_resumes_json_id_resumes_id_fk" FOREIGN KEY ("json_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE "ghosted_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"enabled" boolean NOT NULL,
	"days_til_ghosted" integer NOT NULL
);

CREATE TABLE "matching_algo_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"enable_sbert" boolean DEFAULT true NOT NULL,
	"keyword_strategy" text DEFAULT 'idf-tf' NOT NULL
);

ALTER TABLE "resumes" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;
`;
