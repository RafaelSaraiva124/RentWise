ALTER TABLE "propriedades" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "propriedades" CASCADE;--> statement-breakpoint
ALTER TABLE "rendas" DROP CONSTRAINT "rendas_propriedade_id_propriedades_id_fk";
--> statement-breakpoint
ALTER TABLE "rendas" DROP COLUMN "propriedade_id";