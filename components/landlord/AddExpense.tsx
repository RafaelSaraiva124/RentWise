"use client";

import React, { useState } from "react";
import { Plus, Receipt, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { addElectricityExpense, addWaterExpense } from "@/lib/actions/expenses";
import { toast } from "sonner";

interface AddExpenseProps {
  contracts: any[];
  onSuccess?: () => void;
}

export const AddExpense: React.FC<AddExpenseProps> = ({
  contracts,
  onSuccess,
}) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseType, setExpenseType] = useState<"AGUA" | "ELETRICIDADE">(
    "AGUA",
  );

  // Forms para diferentes tipos de despesas
  const [waterForm, setWaterForm] = useState({
    contratoId: "",
    leituraAnterior: "",
    leituraAtual: "",
    precoM3: "",
    taxaFixa: "",
    mesReferencia: getCurrentMonth(),
    dataVencimento: getDefaultDueDate(),
    descricao: "",
  });

  const [electricityForm, setElectricityForm] = useState({
    contratoId: "",
    leituraAnterior: "",
    leituraAtual: "",
    precoKwh: "",
    taxaFixa: "",
    mesReferencia: getCurrentMonth(),
    dataVencimento: getDefaultDueDate(),
    descricao: "",
  });

  // Funções auxiliares
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function getDefaultDueDate(contract?: any) {
    const now = new Date();
    if (contract?.diaVencimento) {
      const dueDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        contract.diaVencimento,
      );
      if (dueDate < now) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      return dueDate.toISOString().split("T")[0];
    }
    // Default: dia 10 do próximo mês
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 10);
    return nextMonth.toISOString().split("T")[0];
  }

  function formatCurrency(valor: number) {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(valor);
  }

  const resetForms = () => {
    setWaterForm({
      contratoId: "",
      leituraAnterior: "",
      leituraAtual: "",
      precoM3: "",
      taxaFixa: "",
      mesReferencia: getCurrentMonth(),
      dataVencimento: getDefaultDueDate(),
      descricao: "",
    });
    setElectricityForm({
      contratoId: "",
      leituraAnterior: "",
      leituraAtual: "",
      precoKwh: "",
      taxaFixa: "",
      mesReferencia: getCurrentMonth(),
      dataVencimento: getDefaultDueDate(),
      descricao: "",
    });
  };

  const handleAddWaterExpense = async () => {
    const {
      contratoId,
      leituraAnterior,
      leituraAtual,
      precoM3,
      mesReferencia,
      dataVencimento,
    } = waterForm;

    if (
      !contratoId ||
      !leituraAnterior ||
      !leituraAtual ||
      !precoM3 ||
      !mesReferencia ||
      !dataVencimento
    ) {
      toast.error("Todos os campos obrigatórios devem ser preenchidos");
      return;
    }

    if (parseFloat(leituraAtual) <= parseFloat(leituraAnterior)) {
      toast.error("A leitura atual deve ser maior que a leitura anterior");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(waterForm).forEach(([key, value]) => {
        form.append(key, value);
      });

      const result = await addWaterExpense(form);
      if (result.success) {
        toast.success("Despesa de água adicionada com sucesso!");
        setShowAddExpense(false);
        resetForms();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Erro ao adicionar despesa de água");
      }
    } catch (error) {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddElectricityExpense = async () => {
    const {
      contratoId,
      leituraAnterior,
      leituraAtual,
      precoKwh,
      mesReferencia,
      dataVencimento,
    } = electricityForm;

    if (
      !contratoId ||
      !leituraAnterior ||
      !leituraAtual ||
      !precoKwh ||
      !mesReferencia ||
      !dataVencimento
    ) {
      toast.error("Todos os campos obrigatórios devem ser preenchidos");
      return;
    }

    if (parseFloat(leituraAtual) <= parseFloat(leituraAnterior)) {
      toast.error("A leitura atual deve ser maior que a leitura anterior");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(electricityForm).forEach(([key, value]) => {
        form.append(key, value);
      });

      const result = await addElectricityExpense(form);
      if (result.success) {
        toast.success("Despesa de eletricidade adicionada com sucesso!");
        setShowAddExpense(false);
        resetForms();
        if (onSuccess) onSuccess();
      } else {
        toast.error(
          result.error || "Erro ao adicionar despesa de eletricidade",
        );
      }
    } catch (error) {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-600">
          Gestão de Despesas
        </h2>
        <Button
          onClick={() => {
            setShowAddExpense(!showAddExpense);
            if (!showAddExpense) {
              resetForms();
            }
          }}
          disabled={contracts.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showAddExpense ? "Cancelar" : "Nova Despesa"}
        </Button>
      </div>

      {contracts.length === 0 && (
        <Card className="mb-6">
          <CardContent className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">
              Você precisa ter contratos ativos para adicionar despesas.
            </p>
          </CardContent>
        </Card>
      )}

      {showAddExpense && contracts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Adicionar Nova Despesa</CardTitle>
            <CardDescription>
              Crie uma nova despesa baseada num contrato existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>Tipo de Despesa</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Button
                  type="button"
                  variant={expenseType === "AGUA" ? "default" : "outline"}
                  onClick={() => setExpenseType("AGUA")}
                  className="flex items-center gap-2"
                >
                  <Droplets className="h-4 w-4" />
                  Água
                </Button>
                <Button
                  type="button"
                  variant={
                    expenseType === "ELETRICIDADE" ? "default" : "outline"
                  }
                  onClick={() => setExpenseType("ELETRICIDADE")}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Eletricidade
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Apenas água e eletricidade têm cálculo automático baseado em
                leituras
              </p>
            </div>

            {expenseType === "AGUA" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Contrato *</Label>
                  <select
                    value={waterForm.contratoId}
                    onChange={(e) => {
                      const selectedContract = contracts.find(
                        (c) => c.id === e.target.value,
                      );
                      setWaterForm((prev) => ({
                        ...prev,
                        contratoId: e.target.value,
                        dataVencimento: selectedContract
                          ? getDefaultDueDate(selectedContract)
                          : getDefaultDueDate(),
                      }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um contrato</option>
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.propriedadeNome} - {contract.inquilinoNome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Leitura Anterior (m³) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={waterForm.leituraAnterior}
                    onChange={(e) =>
                      setWaterForm((prev) => ({
                        ...prev,
                        leituraAnterior: e.target.value,
                      }))
                    }
                    placeholder="1250.500"
                  />
                </div>
                <div>
                  <Label>Leitura Atual (m³) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={waterForm.leituraAtual}
                    onChange={(e) =>
                      setWaterForm((prev) => ({
                        ...prev,
                        leituraAtual: e.target.value,
                      }))
                    }
                    placeholder="1275.200"
                  />
                </div>
                <div>
                  <Label>Preço por m³ (€) *</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={waterForm.precoM3}
                    onChange={(e) =>
                      setWaterForm((prev) => ({
                        ...prev,
                        precoM3: e.target.value,
                      }))
                    }
                    placeholder="1.2500"
                  />
                </div>
                <div>
                  <Label>Taxa Fixa (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={waterForm.taxaFixa}
                    onChange={(e) =>
                      setWaterForm((prev) => ({
                        ...prev,
                        taxaFixa: e.target.value,
                      }))
                    }
                    placeholder="5.00"
                  />
                </div>
                <div>
                  <Label>Mês de Referência *</Label>
                  <Input
                    type="month"
                    value={waterForm.mesReferencia}
                    onChange={(e) =>
                      setWaterForm((prev) => ({
                        ...prev,
                        mesReferencia: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={waterForm.dataVencimento}
                    onChange={(e) =>
                      setWaterForm((prev) => ({
                        ...prev,
                        dataVencimento: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={waterForm.descricao}
                    onChange={(e) =>
                      setWaterForm((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    placeholder="Conta de água - Janeiro 2025"
                  />
                </div>
                {waterForm.leituraAnterior &&
                  waterForm.leituraAtual &&
                  waterForm.precoM3 && (
                    <div className="md:col-span-2 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700 font-medium">
                        Consumo calculado:{" "}
                        {(
                          parseFloat(waterForm.leituraAtual) -
                          parseFloat(waterForm.leituraAnterior)
                        ).toFixed(1)}{" "}
                        m³
                      </p>
                      <p className="text-sm text-blue-600">
                        Valor estimado:{" "}
                        {formatCurrency(
                          (parseFloat(waterForm.leituraAtual) -
                            parseFloat(waterForm.leituraAnterior)) *
                            parseFloat(waterForm.precoM3) +
                            (parseFloat(waterForm.taxaFixa) || 0),
                        )}
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Eletricidade Form */}
            {expenseType === "ELETRICIDADE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Contrato *</Label>
                  <select
                    value={electricityForm.contratoId}
                    onChange={(e) => {
                      const selectedContract = contracts.find(
                        (c) => c.id === e.target.value,
                      );
                      setElectricityForm((prev) => ({
                        ...prev,
                        contratoId: e.target.value,
                        dataVencimento: selectedContract
                          ? getDefaultDueDate(selectedContract)
                          : getDefaultDueDate(),
                      }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um contrato</option>
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.propriedadeNome} - {contract.inquilinoNome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Leitura Anterior (kWh) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={electricityForm.leituraAnterior}
                    onChange={(e) =>
                      setElectricityForm((prev) => ({
                        ...prev,
                        leituraAnterior: e.target.value,
                      }))
                    }
                    placeholder="12500.500"
                  />
                </div>

                <div>
                  <Label>Leitura Atual (kWh) *</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={electricityForm.leituraAtual}
                    onChange={(e) =>
                      setElectricityForm((prev) => ({
                        ...prev,
                        leituraAtual: e.target.value,
                      }))
                    }
                    placeholder="12750.200"
                  />
                </div>

                <div>
                  <Label>Preço por kWh (€) *</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={electricityForm.precoKwh}
                    onChange={(e) =>
                      setElectricityForm((prev) => ({
                        ...prev,
                        precoKwh: e.target.value,
                      }))
                    }
                    placeholder="0.1850"
                  />
                </div>

                <div>
                  <Label>Taxa Fixa (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={electricityForm.taxaFixa}
                    onChange={(e) =>
                      setElectricityForm((prev) => ({
                        ...prev,
                        taxaFixa: e.target.value,
                      }))
                    }
                    placeholder="8.50"
                  />
                </div>

                <div>
                  <Label>Mês de Referência *</Label>
                  <Input
                    type="month"
                    value={electricityForm.mesReferencia}
                    onChange={(e) =>
                      setElectricityForm((prev) => ({
                        ...prev,
                        mesReferencia: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={electricityForm.dataVencimento}
                    onChange={(e) =>
                      setElectricityForm((prev) => ({
                        ...prev,
                        dataVencimento: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={electricityForm.descricao}
                    onChange={(e) =>
                      setElectricityForm((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    placeholder="Conta de eletricidade - Janeiro 2025"
                  />
                </div>

                {electricityForm.leituraAnterior &&
                  electricityForm.leituraAtual &&
                  electricityForm.precoKwh && (
                    <div className="md:col-span-2 p-3 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-700 font-medium">
                        Consumo calculado:{" "}
                        {(
                          parseFloat(electricityForm.leituraAtual) -
                          parseFloat(electricityForm.leituraAnterior)
                        ).toFixed(1)}{" "}
                        kWh
                      </p>
                      <p className="text-sm text-yellow-600">
                        Valor estimado:{" "}
                        {formatCurrency(
                          (parseFloat(electricityForm.leituraAtual) -
                            parseFloat(electricityForm.leituraAnterior)) *
                            parseFloat(electricityForm.precoKwh) +
                            (parseFloat(electricityForm.taxaFixa) || 0),
                        )}
                      </p>
                    </div>
                  )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                onClick={
                  expenseType === "AGUA"
                    ? handleAddWaterExpense
                    : handleAddElectricityExpense
                }
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adicionando..." : "Adicionar Despesa"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddExpense(false);
                  resetForms();
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
