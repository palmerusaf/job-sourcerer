CREATE TABLE "ghosted_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"enabled" boolean NOT NULL,
	"days_til_ghosted" integer NOT NULL
);
