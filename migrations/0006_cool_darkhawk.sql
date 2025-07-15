CREATE TABLE "contratos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"propriedade_id" uuid NOT NULL,
	"inquilino_id" uuid NOT NULL,
	"senhorio_id" uuid NOT NULL,
	"data_inicio" date NOT NULL,
	"data_fim" date,
	"valor_renda" numeric(10, 2) NOT NULL,
	"dia_vencimento" integer DEFAULT 5 NOT NULL,
	"ativo" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "contratos_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "propriedades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senhorio_id" uuid NOT NULL,
	"nome" varchar(255) NOT NULL,
	"endereco" text NOT NULL,
	"descricao" text,
	"valor_renda" numeric(10, 2) NOT NULL,
	"ativa" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "propriedades_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "rendas" ADD COLUMN "contrato_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "rendas" ADD COLUMN "propriedade_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_propriedade_id_propriedades_id_fk" FOREIGN KEY ("propriedade_id") REFERENCES "public"."propriedades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_inquilino_id_users_id_fk" FOREIGN KEY ("inquilino_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_senhorio_id_users_id_fk" FOREIGN KEY ("senhorio_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propriedades" ADD CONSTRAINT "propriedades_senhorio_id_users_id_fk" FOREIGN KEY ("senhorio_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendas" ADD CONSTRAINT "rendas_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendas" ADD CONSTRAINT "rendas_propriedade_id_propriedades_id_fk" FOREIGN KEY ("propriedade_id") REFERENCES "public"."propriedades"("id") ON DELETE no action ON UPDATE no action;