CREATE TABLE "matching_algo_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"enable_sbert" boolean DEFAULT true NOT NULL,
	"keyword_strategy" text DEFAULT 'idf-tf' NOT NULL
);
