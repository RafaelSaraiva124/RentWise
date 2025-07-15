"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Zap, Receipt } from "lucide-react";
import { addWaterExpense, addElectricityExpense } from "@/lib/actions/expenses";

interface Contract {
  id: string;
  propriedadeNome: string;
  inquilinoNome: string;
  valorRenda: number;
  diaVencimento: number;
}

interface AddExpenseFormProps {
  contracts: Contract[];
  onSuccess?: () => void;
  onCancel?: () => void;
  showAsCard?: boolean;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  contracts,
  onSuccess,
  onCancel,
  showAsCard = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseType, setExpenseType] = useState<"AGUA" | "ELETRICIDADE">(
    "AGUA",
  );

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const getDefaultDueDate = (contract?: Contract) => {
    const now = new Date();
    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      contract?.diaVencimento || 5,
    );
    return nextMonth.toISOString().split("T")[0];
  };

  const [waterForm, setWaterForm] = useState({
    contratoId: "",
    leituraAnterior: "",
    leituraAtual: "",
    precoM3: "",
    taxaFixa: "",
    mesReferencia: getCurrentMonth(),
    dataVencimento: "",
    descricao: "",
  });

  const [electricityForm, setElectricityForm] = useState({
    contratoId: "",
    leituraAnterior: "",
    leituraAtual: "",
    precoKwh: "",
    taxaFixa: "",
    mesReferencia: getCurrentMonth(),
    dataVencimento: "",
    descricao: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const resetForms = () => {
    setWaterForm({
      contratoId: "",
      leituraAnterior: "",
      leituraAtual: "",
      precoM3: "",
      taxaFixa: "",
      mesReferencia: getCurrentMonth(),
      dataVencimento: "",
      descricao: "",
    });
    setElectricityForm({
      contratoId: "",
      leituraAnterior: "",
      leituraAtual: "",
      precoKwh: "",
      taxaFixa: "",
      mesReferencia: getCurrentMonth(),
      dataVencimento: "",
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
      alert("Todos os campos obrigatórios devem ser preenchidos");
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
        alert("Despesa de água adicionada com sucesso!");
        resetForms();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao adicionar despesa de água");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
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
      alert("Todos os campos obrigatórios devem ser preenchidos");
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
        alert("Despesa de eletricidade adicionada com sucesso!");
        resetForms();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao adicionar despesa de eletricidade");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForms();
    onCancel?.();
  };

  const formContent = (
    <div className="space-y-4">
      {/* Verificar se há contratos */}
      {contracts.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">
            Você precisa ter contratos ativos para adicionar despesas.
          </p>
        </div>
      ) : (
        <>
          {/* Tipo de Despesa Selector */}
          <div>
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
                variant={expenseType === "ELETRICIDADE" ? "default" : "outline"}
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

          {/* Água Form */}
          {expenseType === "AGUA" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="water-contract">Contrato *</Label>
                <select
                  id="water-contract"
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
                        : "",
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
                <Label htmlFor="water-reading-prev">
                  Leitura Anterior (m³) *
                </Label>
                <Input
                  id="water-reading-prev"
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
                <Label htmlFor="water-reading-current">
                  Leitura Atual (m³) *
                </Label>
                <Input
                  id="water-reading-current"
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
                <Label htmlFor="water-price">Preço por m³ (€) *</Label>
                <Input
                  id="water-price"
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
                <Label htmlFor="water-fixed">Taxa Fixa (€)</Label>
                <Input
                  id="water-fixed"
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
                <Label htmlFor="water-month">Mês de Referência *</Label>
                <Input
                  id="water-month"
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
                <Label htmlFor="water-due">Data de Vencimento *</Label>
                <Input
                  id="water-due"
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
                <Label htmlFor="water-desc">Descrição</Label>
                <Input
                  id="water-desc"
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
                <Label htmlFor="electricity-contract">Contrato *</Label>
                <select
                  id="electricity-contract"
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
                        : "",
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
                <Label htmlFor="electricity-reading-prev">
                  Leitura Anterior (kWh) *
                </Label>
                <Input
                  id="electricity-reading-prev"
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
                <Label htmlFor="electricity-reading-current">
                  Leitura Atual (kWh) *
                </Label>
                <Input
                  id="electricity-reading-current"
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
                <Label htmlFor="electricity-price">Preço por kWh (€) *</Label>
                <Input
                  id="electricity-price"
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
                <Label htmlFor="electricity-fixed">Taxa Fixa (€)</Label>
                <Input
                  id="electricity-fixed"
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
                <Label htmlFor="electricity-month">Mês de Referência *</Label>
                <Input
                  id="electricity-month"
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
                <Label htmlFor="electricity-due">Data de Vencimento *</Label>
                <Input
                  id="electricity-due"
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
                <Label htmlFor="electricity-desc">Descrição</Label>
                <Input
                  id="electricity-desc"
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
            {onCancel && (
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (!showAsCard) {
    return formContent;
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Adicionar Nova Despesa</CardTitle>
        <CardDescription>
          Crie uma nova despesa baseada num contrato existente
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default AddExpenseForm;
