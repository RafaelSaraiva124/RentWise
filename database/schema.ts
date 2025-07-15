import {
  integer,
  date,
  varchar,
  uuid,
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core/columns/enum";

export const STATUS_ENUM = pgEnum("status", [
  "INDEFINIDO",
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const ROLE_ENUM = pgEnum("role", ["INQUILINO", "SENHORIO"]);
export const RENDA_STATUS_ENUM = pgEnum("renda_status", [
  "PAGO",
  "PENDENTE",
  "VENCIDO",
]);
export const DESPESA_TIPO_ENUM = pgEnum("despesa_tipo", [
  "AGUA",
  "ELETRICIDADE",
  "GAS",
  "INTERNET",
  "CONDOMINIO",
  "LIMPEZA",
  "MANUTENCAO",
  "OUTROS",
]);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text().notNull(),
  status: STATUS_ENUM("status").default("INDEFINIDO"),
  role: ROLE_ENUM("role").default("INQUILINO"),
  lastActivityDAte: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

// Propriedades do senhorio
export const propriedades = pgTable("propriedades", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  senhorioId: uuid("senhorio_id")
    .notNull()
    .references(() => users.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco").notNull(),
  descricao: text("descricao"),
  valorRenda: decimal("valor_renda", { precision: 10, scale: 2 }).notNull(),
  ativa: boolean("ativa").notNull().default(true),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

// Contratos entre senhorio e inquilino para uma propriedade específica
export const contratos = pgTable("contratos", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  propriedadeId: uuid("propriedade_id")
    .notNull()
    .references(() => propriedades.id),
  inquilinoId: uuid("inquilino_id")
    .notNull()
    .references(() => users.id),
  senhorioId: uuid("senhorio_id")
    .notNull()
    .references(() => users.id),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim"),
  valorRenda: decimal("valor_renda", { precision: 10, scale: 2 }).notNull(),
  diaVencimento: integer("dia_vencimento").notNull().default(5),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

// Rendas baseadas nos contratos
export const rendas = pgTable("rendas", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  contratoId: uuid("contrato_id")
    .notNull()
    .references(() => contratos.id),
  propriedadeId: uuid("propriedade_id")
    .notNull()
    .references(() => propriedades.id),
  inquilinoId: uuid("inquilino_id")
    .notNull()
    .references(() => users.id),
  senhorioId: uuid("senhorio_id")
    .notNull()
    .references(() => users.id),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  mesReferencia: varchar("mes_referencia", { length: 7 }).notNull(), // formato: YYYY-MM
  dataVencimento: date("data_vencimento").notNull(),
  dataPagamento: date("data_pagamento"),
  status: RENDA_STATUS_ENUM("status").default("PENDENTE"),
  descricao: text("descricao"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

// Nova tabela de despesas com cálculos automáticos
export const despesas = pgTable("despesas", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  contratoId: uuid("contrato_id")
    .notNull()
    .references(() => contratos.id),
  propriedadeId: uuid("propriedade_id")
    .notNull()
    .references(() => propriedades.id),
  inquilinoId: uuid("inquilino_id")
    .notNull()
    .references(() => users.id),
  senhorioId: uuid("senhorio_id")
    .notNull()
    .references(() => users.id),
  tipo: DESPESA_TIPO_ENUM("tipo").notNull(),

  // Campos para cálculo automático
  // ÁGUA
  leituraAnteriorAgua: decimal("leitura_anterior_agua", {
    precision: 10,
    scale: 3,
  }), // m³
  leituraAtualAgua: decimal("leitura_atual_agua", { precision: 10, scale: 3 }), // m³
  precoM3Agua: decimal("preco_m3_agua", { precision: 10, scale: 4 }), // €/m³
  taxaFixaAgua: decimal("taxa_fixa_agua", { precision: 10, scale: 2 }), // € (taxa fixa mensal)

  // ELETRICIDADE
  leituraAnteriorEletricidade: decimal("leitura_anterior_eletricidade", {
    precision: 10,
    scale: 3,
  }), // kWh
  leituraAtualEletricidade: decimal("leitura_atual_eletricidade", {
    precision: 10,
    scale: 3,
  }), // kWh
  precoKwhEletricidade: decimal("preco_kwh_eletricidade", {
    precision: 10,
    scale: 4,
  }), // €/kWh
  taxaFixaEletricidade: decimal("taxa_fixa_eletricidade", {
    precision: 10,
    scale: 2,
  }), // € (taxa fixa mensal)

  // Valor calculado automaticamente
  valorCalculado: decimal("valor_calculado", { precision: 10, scale: 2 }), // € (calculado automaticamente)
  valorFinal: decimal("valor_final", { precision: 10, scale: 2 }).notNull(), // € (pode ser ajustado manualmente)

  mesReferencia: varchar("mes_referencia", { length: 7 }).notNull(), // formato: YYYY-MM
  dataVencimento: date("data_vencimento").notNull(),
  dataPagamento: date("data_pagamento"),
  status: RENDA_STATUS_ENUM("status").default("PENDENTE"),
  descricao: text("descricao"),
  observacoes: text("observacoes"), // Para notas sobre ajustes manuais
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});
