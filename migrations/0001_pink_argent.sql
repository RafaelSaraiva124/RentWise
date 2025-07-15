ALTER TYPE "public"."status" ADD VALUE 'NULL' BEFORE 'PENDING';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" DROP NOT NULL;