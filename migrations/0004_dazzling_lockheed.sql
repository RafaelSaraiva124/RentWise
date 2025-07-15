CREATE TABLE "propriedades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senhorio_id" uuid NOT NULL,
	"endereco" varchar(500) NOT NULL,
	"valor_renda" numeric(10, 2) NOT NULL,
	"ativa" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "propriedades_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "rendas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquilino_id" uuid NOT NULL,
	"senhorio_id" uuid NOT NULL,
	"propriedade_id" uuid NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"mes_referencia" varchar(7) NOT NULL,
	"data_vencimento" date NOT NULL,
	"data_pagamento" date,
	"status" "renda_status" DEFAULT 'PENDENTE',
	"descricao" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rendas_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "propriedades" ADD CONSTRAINT "propriedades_senhorio_id_users_id_fk" FOREIGN KEY ("senhorio_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendas" ADD CONSTRAINT "rendas_inquilino_id_users_id_fk" FOREIGN KEY ("inquilino_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendas" ADD CONSTRAINT "rendas_senhorio_id_users_id_fk" FOREIGN KEY ("senhorio_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendas" ADD CONSTRAINT "rendas_propriedade_id_propriedades_id_fk" FOREIGN KEY ("propriedade_id") REFERENCES "public"."propriedades"("id") ON DELETE no action ON UPDATE no action;