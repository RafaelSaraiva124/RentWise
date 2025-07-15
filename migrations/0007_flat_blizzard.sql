CREATE TYPE "public"."despesa_tipo" AS ENUM('AGUA', 'ELETRICIDADE', 'GAS', 'INTERNET', 'CONDOMINIO', 'LIMPEZA', 'MANUTENCAO', 'OUTROS');--> statement-breakpoint
CREATE TABLE "despesas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contrato_id" uuid NOT NULL,
	"propriedade_id" uuid NOT NULL,
	"inquilino_id" uuid NOT NULL,
	"senhorio_id" uuid NOT NULL,
	"tipo" "despesa_tipo" NOT NULL,
	"leitura_anterior_agua" numeric(10, 3),
	"leitura_atual_agua" numeric(10, 3),
	"preco_m3_agua" numeric(10, 4),
	"taxa_fixa_agua" numeric(10, 2),
	"leitura_anterior_eletricidade" numeric(10, 3),
	"leitura_atual_eletricidade" numeric(10, 3),
	"preco_kwh_eletricidade" numeric(10, 4),
	"taxa_fixa_eletricidade" numeric(10, 2),
	"valor_calculado" numeric(10, 2),
	"valor_final" numeric(10, 2) NOT NULL,
	"mes_referencia" varchar(7) NOT NULL,
	"data_vencimento" date NOT NULL,
	"data_pagamento" date,
	"status" "renda_status" DEFAULT 'PENDENTE',
	"descricao" text,
	"observacoes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "despesas_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_contrato_id_contratos_id_fk" FOREIGN KEY ("contrato_id") REFERENCES "public"."contratos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_propriedade_id_propriedades_id_fk" FOREIGN KEY ("propriedade_id") REFERENCES "public"."propriedades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_inquilino_id_users_id_fk" FOREIGN KEY ("inquilino_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_senhorio_id_users_id_fk" FOREIGN KEY ("senhorio_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;