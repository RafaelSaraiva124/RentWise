// types/dashboard.ts

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  status: "INDEFINIDO" | "PENDING" | "APPROVED" | "REJECTED";
  role: "INQUILINO" | "SENHORIO";
  lastActivityDate?: string | null;
  createdAt?: string;
}

export interface Property {
  id: string;
  senhorioId: string;
  nome: string;
  endereco: string;
  descricao?: string | null;
  valorRenda: number; // convertido de string para number no backend
  ativa: boolean;
  createdAt?: string;
}

export interface Contract {
  id: string;
  propriedadeId: string;
  inquilinoId: string;
  senhorioId: string;
  dataInicio: string;
  dataFim?: string | null;
  valorRenda: number; // convertido de string para number no backend
  diaVencimento: number;
  ativo: boolean;
  createdAt?: string;
  // Dados joined das queries
  propriedadeNome?: string;
  propriedadeEndereco?: string;
  inquilinoNome?: string;
  inquilinoEmail?: string;
}

export interface Rent {
  id: string;
  contratoId: string;
  propriedadeId: string;
  inquilinoId: string;
  senhorioId: string;
  valor: number; // convertido de string para number no backend
  mesReferencia: string; // formato: YYYY-MM
  dataVencimento: string;
  dataPagamento?: string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO";
  descricao?: string | null;
  createdAt?: string;
  // Dados joined das queries
  propriedadeNome?: string;
  propriedadeEndereco?: string;
  inquilinoNome?: string;
  inquilinoEmail?: string;
}

export interface Expense {
  id: string;
  contratoId: string;
  propriedadeId: string;
  inquilinoId: string;
  senhorioId: string;
  tipo:
    | "AGUA"
    | "ELETRICIDADE"
    | "GAS"
    | "INTERNET"
    | "CONDOMINIO"
    | "LIMPEZA"
    | "MANUTENCAO"
    | "OUTROS";
  // Campos para água
  leituraAnteriorAgua?: string | null;
  leituraAtualAgua?: string | null;
  precoM3Agua?: string | null;
  taxaFixaAgua?: string | null;
  // Campos para eletricidade
  leituraAnteriorEletricidade?: string | null;
  leituraAtualEletricidade?: string | null;
  precoKwhEletricidade?: string | null;
  taxaFixaEletricidade?: string | null;
  // Valores calculados
  valorCalculado?: string | null;
  valorFinal: number; // convertido de string para number no backend
  mesReferencia: string; // formato: YYYY-MM
  dataVencimento: string;
  dataPagamento?: string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO";
  descricao?: string | null;
  observacoes?: string | null;
  createdAt?: string;
  // Dados joined das queries
  propriedadeNome?: string;
  propriedadeEndereco?: string;
  inquilinoNome?: string;
  inquilinoEmail?: string;
}

export interface DashboardSummary {
  totalPending: number;
  totalReceived: number;
  pendingCount: number;
  totalRents: number;
  totalProperties: number;
  totalContracts: number;
}

export interface LandlordData {
  user: User;
  properties: Property[];
  contracts: Contract[];
  rents: Rent[];
  expenses: Expense[];
  summary: DashboardSummary;
}

// Types para respostas das actions
export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos auxiliares para formulários
export interface PropertyFormData {
  nome: string;
  endereco: string;
  descricao?: string;
  valorRenda: string;
}

export interface ContractFormData {
  propriedadeId: string;
  inquilinoEmail: string;
  dataInicio: string;
  dataFim?: string;
  valorRenda: string;
  diaVencimento: string;
}

export interface RentFormData {
  contratoId: string;
  mesReferencia: string;
  dataVencimento: string;
  descricao?: string;
}

export interface WaterExpenseFormData {
  contratoId: string;
  leituraAnterior: string;
  leituraAtual: string;
  precoM3: string;
  taxaFixa?: string;
  mesReferencia: string;
  dataVencimento: string;
  descricao?: string;
}

export interface ElectricityExpenseFormData {
  contratoId: string;
  leituraAnterior: string;
  leituraAtual: string;
  precoKwh: string;
  taxaFixa?: string;
  mesReferencia: string;
  dataVencimento: string;
  descricao?: string;
}
