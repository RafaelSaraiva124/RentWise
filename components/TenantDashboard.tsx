"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Euro,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  User,
  Droplets,
  Zap,
  Receipt,
  Flame,
  Wifi,
  Building2,
  Wrench,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "INQUILINO" | "SENHORIO" | null;
  status: "INDEFINIDO" | "PENDING" | "APPROVED" | "REJECTED" | null;
}

interface Rent {
  id: string;
  inquilinoId: string;
  senhorioId: string;
  valor: number;
  mesReferencia: string;
  dataVencimento: Date | string;
  dataPagamento: Date | string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO" | null;
  descricao: string | null;
  createdAt: Date | null;
  contratoId?: string;
  observacoes?: string | null;
}

interface Expense {
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
  valorFinal: number;
  mesReferencia: string;
  dataVencimento: string;
  dataPagamento: string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO";
  descricao: string | null;
  observacoes: string | null;
  createdAt: Date | null;
  propriedadeNome: string;
  propriedadeEndereco: string;
  inquilinoNome: string;
  inquilinoEmail: string;
  // Campos específicos para água
  leituraAnteriorAgua?: number;
  leituraAtualAgua?: number;
  precoM3Agua?: number;
  taxaFixaAgua?: number;
  // Campos específicos para eletricidade
  leituraAnteriorEletricidade?: number;
  leituraAtualEletricidade?: number;
  precoKwhEletricidade?: number;
  taxaFixaEletricidade?: number;
  valorCalculado?: number;
}

interface TenantData {
  user: User;
  rents: Rent[];
  expenses: Expense[];
  summary: {
    totalPending: number;
    pendingCount: number;
    totalRents: number;
    totalExpensesPending: number;
    expensesPendingCount: number;
    totalExpenses: number;
  };
}

interface TenantDashboardProps {
  initialData: TenantData;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ initialData }) => {
  const [activeTab, setActiveTab] = useState<"rents" | "expenses">("rents");
  const data = initialData;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "PAGO":
        return "bg-green-100 text-green-800";
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-800";
      case "VENCIDO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "PAGO":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDENTE":
        return <Clock className="h-4 w-4" />;
      case "VENCIDO":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getExpenseIcon = (tipo: string) => {
    switch (tipo) {
      case "AGUA":
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case "ELETRICIDADE":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "GAS":
        return <Flame className="h-5 w-5 text-orange-500" />;
      case "INTERNET":
        return <Wifi className="h-5 w-5 text-purple-500" />;
      case "CONDOMINIO":
        return <Building2 className="h-5 w-5 text-gray-500" />;
      case "LIMPEZA":
        return <Sparkles className="h-5 w-5 text-pink-500" />;
      case "MANUTENCAO":
        return <Wrench className="h-5 w-5 text-red-500" />;
      case "OUTROS":
        return <Receipt className="h-5 w-5 text-gray-500" />;
      default:
        return <Receipt className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bem-vindo, {data.user.fullName}
              </h1>
              <p className="text-gray-600 mt-1">
                Dashboard do Inquilino - RentWise
              </p>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <Badge variant="outline" className="text-sm">
                {data.user.role || "INQUILINO"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rendas Pendentes
              </CardTitle>
              <Euro className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(data.summary.totalPending)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {data.summary.pendingCount}{" "}
                {data.summary.pendingCount === 1
                  ? "renda pendente"
                  : "rendas pendentes"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas Pendentes
              </CardTitle>
              <Receipt className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(data.summary.totalExpensesPending || 0)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {data.summary.expensesPendingCount || 0}{" "}
                {(data.summary.expensesPendingCount || 0) === 1
                  ? "despesa pendente"
                  : "despesas pendentes"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "rents" ? "default" : "outline"}
            onClick={() => setActiveTab("rents")}
            className="flex items-center gap-2 text-black"
          >
            <Home className="h-4 w-4" />
            Rendas ({data.rents.length})
          </Button>
          <Button
            variant={activeTab === "expenses" ? "default" : "outline"}
            onClick={() => setActiveTab("expenses")}
            className="flex items-center gap-2 text-black"
          >
            <Receipt className="h-4 w-4" />
            Despesas ({data.expenses?.length || 0})
          </Button>
        </div>

        {/* Rendas Tab */}
        {activeTab === "rents" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Minhas Rendas
              </CardTitle>
              <CardDescription>
                Gerir os seus pagamentos de renda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.rents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ainda não tem rendas registadas
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quando o seu senhorio adicionar rendas, elas aparecerão
                      aqui.
                    </p>
                  </div>
                ) : (
                  data.rents.map((rent) => (
                    <div
                      key={rent.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {rent.descricao || `Renda ${rent.mesReferencia}`}
                          </h4>
                          <Badge className={getStatusColor(rent.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(rent.status)}
                              {rent.status || "INDEFINIDO"}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Vencimento: {formatDate(rent.dataVencimento)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(rent.valor)}
                          </span>
                        </div>
                        {rent.status === "PAGO" && rent.dataPagamento && (
                          <p className="text-xs text-green-600 mt-1">
                            Pago em: {formatDate(rent.dataPagamento)}
                          </p>
                        )}
                        {rent.observacoes && (
                          <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-2 rounded">
                            <strong>Observações:</strong> {rent.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Despesas Tab */}
        {activeTab === "expenses" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Minhas Despesas
              </CardTitle>
              <CardDescription>
                Água, eletricidade e outras despesas da propriedade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!data.expenses || data.expenses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ainda não tem despesas registadas
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quando o seu senhorio adicionar despesas, elas aparecerão
                      aqui.
                    </p>
                  </div>
                ) : (
                  data.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getExpenseIcon(expense.tipo)}
                            <h4 className="font-medium">
                              {expense.descricao ||
                                `${expense.tipo} ${expense.mesReferencia}`}
                            </h4>
                            <Badge className={getStatusColor(expense.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(expense.status)}
                                {expense.status}
                              </span>
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <p>
                              <strong>Propriedade:</strong>{" "}
                              {expense.propriedadeNome}
                            </p>
                            <p className="text-gray-500">
                              {expense.propriedadeEndereco}
                            </p>
                          </div>

                          {/* Detalhes específicos do tipo */}
                          {expense.tipo === "AGUA" &&
                            expense.leituraAtualAgua &&
                            expense.leituraAnteriorAgua && (
                              <div className="text-xs text-gray-500 mt-2 space-y-1 bg-blue-50 p-2 rounded">
                                <div>
                                  <strong>Consumo:</strong>{" "}
                                  {(
                                    expense.leituraAtualAgua -
                                    expense.leituraAnteriorAgua
                                  ).toFixed(1)}{" "}
                                  m³
                                </div>
                                <div>
                                  <strong>Leituras:</strong>{" "}
                                  {expense.leituraAnteriorAgua.toFixed(3)} →{" "}
                                  {expense.leituraAtualAgua.toFixed(3)} m³
                                </div>
                                {expense.precoM3Agua && (
                                  <div>
                                    <strong>Preço:</strong>{" "}
                                    {formatCurrency(expense.precoM3Agua)}/m³
                                  </div>
                                )}
                              </div>
                            )}

                          {expense.tipo === "ELETRICIDADE" &&
                            expense.leituraAtualEletricidade &&
                            expense.leituraAnteriorEletricidade && (
                              <div className="text-xs text-gray-500 mt-2 space-y-1 bg-yellow-50 p-2 rounded">
                                <div>
                                  <strong>Consumo:</strong>{" "}
                                  {(
                                    expense.leituraAtualEletricidade -
                                    expense.leituraAnteriorEletricidade
                                  ).toFixed(1)}{" "}
                                  kWh
                                </div>
                                <div>
                                  <strong>Leituras:</strong>{" "}
                                  {expense.leituraAnteriorEletricidade.toFixed(
                                    3,
                                  )}{" "}
                                  →{" "}
                                  {expense.leituraAtualEletricidade.toFixed(3)}{" "}
                                  kWh
                                </div>
                                {expense.precoKwhEletricidade && (
                                  <div>
                                    <strong>Preço:</strong>{" "}
                                    {formatCurrency(
                                      expense.precoKwhEletricidade,
                                    )}
                                    /kWh
                                  </div>
                                )}
                              </div>
                            )}

                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vencimento: {formatDate(expense.dataVencimento)}
                            </span>
                            {expense.status === "PAGO" &&
                              expense.dataPagamento && (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Pago em: {formatDate(expense.dataPagamento)}
                                </span>
                              )}
                          </div>

                          {expense.observacoes && (
                            <div className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                              <strong>Observações:</strong>{" "}
                              {expense.observacoes}
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-xl font-bold">
                            {formatCurrency(expense.valorFinal)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {expense.mesReferencia}
                          </p>
                          {expense.valorCalculado &&
                            expense.valorFinal !== expense.valorCalculado && (
                              <p className="text-xs text-blue-600">
                                Calculado:{" "}
                                {formatCurrency(expense.valorCalculado)}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard;
