CREATE TYPE "public"."renda_status" AS ENUM('PAGO', 'PENDENTE', 'VENCIDO');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('INQUILINO', 'SENHORIO');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"status" "status" DEFAULT 'PENDING' NOT NULL,
	"role" "role" DEFAULT 'INQUILINO',
	"last_activity_date" date DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
