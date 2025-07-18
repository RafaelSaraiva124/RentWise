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
  Home,
  User,
  ArrowLeft,
  ClipboardList,
  FileText,
  Plus,
  Droplets,
  Zap,
} from "lucide-react";
import {
  LandlordData,
  Property,
  Contract,
  Rent,
  Expense,
  User as UserType,
} from "@/types/dashboard";
import QuickActions from "@/components/landlord/QuickActions";

interface LandlordDashboardProps {
  initialData: LandlordData;
}

export function LandlordDashboard({ initialData }: LandlordDashboardProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  // Propriedade selecionada
  const selectedProperty = selectedPropertyId
    ? initialData.properties.find((p) => p.id === selectedPropertyId) || null
    : null;

  // Formatação moeda
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(numValue);
  };

  // Formatação data
  const formatDate = (date: string | Date) =>
    new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));

  // Vista detalhada da propriedade
  if (selectedProperty) {
    const propertyContracts = initialData.contracts.filter(
      (c) => c.propriedadeId === selectedProperty.id,
    );
    const propertyRents = initialData.rents.filter(
      (r) => r.propriedadeId === selectedProperty.id,
    );
    const propertyExpenses =
      initialData.expenses?.filter(
        (e) => e.propriedadeId === selectedProperty.id,
      ) || [];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 flex items-center gap-2"
            onClick={() => setSelectedPropertyId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl text-gray-800 font-bold mb-2">
              {selectedProperty.nome}
            </h1>
            <p className="text-gray-600 mb-2">{selectedProperty.endereco}</p>
            {selectedProperty.descricao && (
              <p className="text-gray-500 mb-4">{selectedProperty.descricao}</p>
            )}
            <Badge className="bg-blue-100 text-blue-800">
              Renda: {formatCurrency(selectedProperty.valorRenda)}/mês
            </Badge>
          </div>

          {/* Contratos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Contratos da Propriedade
              </CardTitle>
              <CardDescription>Contratos ativos e inquilinos</CardDescription>
            </CardHeader>
            <CardContent>
              {propertyContracts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Sem contratos ativos para esta propriedade.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {propertyContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="border border-gray-200 p-4 rounded-lg bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Inquilino</p>
                          <p className="font-medium">
                            {contract.inquilinoNome}
                          </p>
                          <p className="text-sm text-gray-500">
                            {contract.inquilinoEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Valor da Renda
                          </p>
                          <p className="font-medium text-lg">
                            {formatCurrency(contract.valorRenda)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Período</p>
                          <p className="font-medium">
                            {formatDate(contract.dataInicio)} -{" "}
                            {contract.dataFim
                              ? formatDate(contract.dataFim)
                              : "Indefinido"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Dia Vencimento
                          </p>
                          <p className="font-medium">
                            Dia {contract.diaVencimento}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rendas */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Rendas
              </CardTitle>
              <CardDescription>Histórico de pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              {propertyRents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Euro className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Sem rendas registadas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {propertyRents.map((rent) => (
                    <div
                      key={rent.id}
                      className="border border-gray-200 p-4 rounded-lg bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {new Date(
                              rent.mesReferencia + "-01",
                            ).toLocaleDateString("pt-PT", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            Vencimento: {formatDate(rent.dataVencimento)}
                          </p>
                          {rent.status === "PAGO" && rent.dataPagamento && (
                            <p className="text-sm text-green-600">
                              Pago em: {formatDate(rent.dataPagamento)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatCurrency(rent.valor)}
                          </p>
                          <Badge
                            variant={
                              rent.status === "PAGO"
                                ? "secondary"
                                : rent.status === "VENCIDO"
                                  ? "destructive"
                                  : "outline"
                            }
                            className={
                              rent.status === "PAGO"
                                ? "bg-green-100 text-green-800"
                                : rent.status === "PENDENTE"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ""
                            }
                          >
                            {rent.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Despesas
              </CardTitle>
              <CardDescription>
                Despesas relacionadas com a propriedade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertyExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Sem despesas registadas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {propertyExpenses.map((expense) => {
                    const consumption =
                      expense.tipo === "AGUA"
                        ? expense.leituraAtualAgua &&
                          expense.leituraAnteriorAgua
                          ? parseFloat(expense.leituraAtualAgua) -
                            parseFloat(expense.leituraAnteriorAgua)
                          : 0
                        : expense.leituraAtualEletricidade &&
                            expense.leituraAnteriorEletricidade
                          ? parseFloat(expense.leituraAtualEletricidade) -
                            parseFloat(expense.leituraAnteriorEletricidade)
                          : 0;

                    return (
                      <div
                        key={expense.id}
                        className="border border-gray-200 p-4 rounded-lg bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {expense.tipo === "AGUA" ? (
                                <Droplets className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Zap className="h-4 w-4 text-yellow-500" />
                              )}
                              <p className="font-medium">{expense.tipo}</p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                expense.mesReferencia + "-01",
                              ).toLocaleDateString("pt-PT", {
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            {consumption > 0 && (
                              <p className="text-sm text-gray-600">
                                Consumo: {consumption.toFixed(1)}{" "}
                                {expense.tipo === "AGUA" ? "m³" : "kWh"}
                              </p>
                            )}
                            {expense.descricao && (
                              <p className="text-sm text-gray-500">
                                {expense.descricao}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              {formatCurrency(expense.valorFinal)}
                            </p>
                            <Badge
                              variant={
                                expense.status === "PAGO"
                                  ? "secondary"
                                  : expense.status === "VENCIDO"
                                    ? "destructive"
                                    : "outline"
                              }
                              className={
                                expense.status === "PAGO"
                                  ? "bg-green-100 text-green-800"
                                  : expense.status === "PENDENTE"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : ""
                              }
                            >
                              {expense.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista principal do dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Bem-vindo, {initialData.user.fullName}
            </h1>
            <p className="text-gray-600 mt-1">
              Dashboard do Senhorio - RentWise
            </p>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-gray-500" />
            <Badge variant="outline" className="text-sm">
              {initialData.user.role || "SENHORIO"}
            </Badge>
          </div>
        </header>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">
                  Total Recebido
                </CardTitle>
                <Euro className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(initialData.summary.totalReceived)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">
                  Rendas Pendentes
                </CardTitle>
                <Euro className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(initialData.summary.totalPending)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {initialData.summary.pendingCount}{" "}
                {initialData.summary.pendingCount === 1 ? "renda" : "rendas"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">
                  Propriedades
                </CardTitle>
                <Home className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {initialData.summary.totalProperties}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {initialData.summary.totalContracts} com contrato ativo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <QuickActions
          properties={initialData.properties}
          contracts={initialData.contracts}
          onSuccess={() => window.location.reload()}
        />

        {/* As suas Propriedades */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            As suas Propriedades
          </h2>

          {initialData.properties.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg mb-4">
                  Não tem propriedades registadas.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Propriedade
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialData.properties.map((property) => {
                const propertyContract = initialData.contracts.find(
                  (c) => c.propriedadeId === property.id,
                );
                const propertyRents = initialData.rents.filter(
                  (r) => r.propriedadeId === property.id,
                );
                const pendingRents = propertyRents.filter(
                  (r) => r.status === "PENDENTE",
                ).length;

                return (
                  <Card
                    key={property.id}
                    onClick={() => setSelectedPropertyId(property.id)}
                    className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {property.nome}
                        </CardTitle>
                        <Badge
                          variant={propertyContract ? "secondary" : "outline"}
                          className={
                            propertyContract
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {propertyContract ? "Ocupada" : "Vaga"}
                        </Badge>
                      </div>
                      <CardDescription>{property.endereco}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Valor Renda
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(property.valorRenda)}
                          </span>
                        </div>

                        {propertyContract && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Inquilino
                              </span>
                              <span className="text-sm font-medium">
                                {propertyContract.inquilinoNome}
                              </span>
                            </div>

                            {pendingRents > 0 && (
                              <div className="pt-2 border-t">
                                <Badge
                                  variant="outline"
                                  className="w-full justify-center bg-yellow-50 text-yellow-700 border-yellow-200"
                                >
                                  {pendingRents}{" "}
                                  {pendingRents === 1
                                    ? "renda pendente"
                                    : "rendas pendentes"}
                                </Badge>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default LandlordDashboard;
