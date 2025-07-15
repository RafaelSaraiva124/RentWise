ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'NULL'::text;--> statement-breakpoint
DROP TYPE "public"."status";--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('INDEFINIDO', 'PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'NULL'::"public"."status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";