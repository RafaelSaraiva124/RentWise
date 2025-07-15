import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Receipt,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Droplets,
  Edit3,
  Save,
  X,
  Flame,
  Wifi,
  Building2,
  Wrench,
  Sparkles,
} from "lucide-react";
import {
  addWaterExpense,
  addElectricityExpense,
  updateExpenseStatus,
  adjustExpenseValue,
} from "@/lib/actions/expenses";

interface Contract {
  id: string;
  propriedadeNome: string;
  inquilinoNome: string;
  valorRenda: number;
  diaVencimento: number;
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

interface ExpensesTabProps {
  contracts: Contract[];
  expenses: Expense[];
  showAddExpense: boolean;
  onToggleAddExpense: () => void;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({
  contracts,
  expenses,
  showAddExpense,
  onToggleAddExpense,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingExpenseIds, setLoadingExpenseIds] = useState<Set<string>>(
    new Set(),
  );
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editObservations, setEditObservations] = useState<string>("");
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
    mesReferencia: "",
    dataVencimento: "",
    descricao: "",
  });

  const [electricityForm, setElectricityForm] = useState({
    contratoId: "",
    leituraAnterior: "",
    leituraAtual: "",
    precoKwh: "",
    taxaFixa: "",
    mesReferencia: "",
    dataVencimento: "",
    descricao: "",
  });

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

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const resetForms = () => {
    setWaterForm({
      contratoId: "",
      leituraAnterior: "",
      leituraAtual: "",
      precoM3: "",
      taxaFixa: "",
      mesReferencia: "",
      dataVencimento: "",
      descricao: "",
    });
    setElectricityForm({
      contratoId: "",
      leituraAnterior: "",
      leituraAtual: "",
      precoKwh: "",
      taxaFixa: "",
      mesReferencia: "",
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
        onToggleAddExpense();
        resetForms();
        window.location.reload();
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
        onToggleAddExpense();
        resetForms();
        window.location.reload();
      } else {
        alert(result.error || "Erro ao adicionar despesa de eletricidade");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpenseStatus = async (
    expenseId: string,
    newStatus: "PAGO" | "PENDENTE" | "VENCIDO",
  ) => {
    setLoadingExpenseIds((prev) => new Set(prev).add(expenseId));

    try {
      const result = await updateExpenseStatus(expenseId, newStatus);

      if (result.success) {
        alert(
          result.message || `Despesa marcada como ${newStatus.toLowerCase()}`,
        );
        window.location.reload();
      } else {
        alert(result.error || "Erro ao atualizar status da despesa");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setLoadingExpenseIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(expenseId);
        return newSet;
      });
    }
  };

  const handleAdjustValue = async (expenseId: string) => {
    const newValue = parseFloat(editValue);

    if (isNaN(newValue) || newValue <= 0) {
      alert("Valor deve ser um número positivo");
      return;
    }

    try {
      const result = await adjustExpenseValue(
        expenseId,
        newValue,
        editObservations,
      );

      if (result.success) {
        alert("Valor ajustado com sucesso!");
        setEditingExpense(null);
        setEditValue("");
        setEditObservations("");
        window.location.reload();
      } else {
        alert(result.error || "Erro ao ajustar valor");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    }
  };

  const startEditing = (expense: Expense) => {
    setEditingExpense(expense.id);
    setEditValue(expense.valorFinal.toString());
    setEditObservations(expense.observacoes || "");
  };

  const cancelEditing = () => {
    setEditingExpense(null);
    setEditValue("");
    setEditObservations("");
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
            onToggleAddExpense();
            if (!showAddExpense) {
              setWaterForm((prev) => ({
                ...prev,
                mesReferencia: getCurrentMonth(),
                dataVencimento: getDefaultDueDate(),
              }));
              setElectricityForm((prev) => ({
                ...prev,
                mesReferencia: getCurrentMonth(),
                dataVencimento: getDefaultDueDate(),
              }));
            }
          }}
          disabled={contracts.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showAddExpense ? "Cancelar" : "Nova Despesa"}
        </Button>
      </div>

      {/* No Contracts Message */}
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

      {/* Add Expense Form */}
      {showAddExpense && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Adicionar Nova Despesa</CardTitle>
            <CardDescription>
              Crie uma nova despesa baseada num contrato existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tipo de Despesa Selector */}
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

            {/* Água Form */}
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
                  onToggleAddExpense();
                  resetForms();
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ainda não há despesas registadas
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Adicione despesas de água, eletricidade e outros serviços.
            </p>
            {contracts.length > 0 && (
              <Button onClick={onToggleAddExpense}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Despesa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card
              key={expense.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getExpenseIcon(expense.tipo)}
                      <h3 className="font-semibold">
                        {expense.descricao ||
                          `${expense.tipo} ${expense.mesReferencia}`}
                      </h3>
                      <Badge className={getStatusColor(expense.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(expense.status)}
                          {expense.status}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-gray-600 font-medium">
                      {expense.propriedadeNome}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expense.propriedadeEndereco}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Inquilino:</strong> {expense.inquilinoNome}
                    </p>

                    {/* Detalhes específicos do tipo */}
                    {expense.tipo === "AGUA" &&
                      expense.leituraAtualAgua &&
                      expense.leituraAnteriorAgua && (
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div>
                            Consumo:{" "}
                            {(
                              expense.leituraAtualAgua -
                              expense.leituraAnteriorAgua
                            ).toFixed(1)}{" "}
                            m³
                          </div>
                          <div>
                            Leituras: {expense.leituraAnteriorAgua.toFixed(3)} →{" "}
                            {expense.leituraAtualAgua.toFixed(3)} m³
                          </div>
                          {expense.precoM3Agua && (
                            <div>
                              Preço: {formatCurrency(expense.precoM3Agua)}/m³
                            </div>
                          )}
                        </div>
                      )}

                    {expense.tipo === "ELETRICIDADE" &&
                      expense.leituraAtualEletricidade &&
                      expense.leituraAnteriorEletricidade && (
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div>
                            Consumo:{" "}
                            {(
                              expense.leituraAtualEletricidade -
                              expense.leituraAnteriorEletricidade
                            ).toFixed(1)}{" "}
                            kWh
                          </div>
                          <div>
                            Leituras:{" "}
                            {expense.leituraAnteriorEletricidade.toFixed(3)} →{" "}
                            {expense.leituraAtualEletricidade.toFixed(3)} kWh
                          </div>
                          {expense.precoKwhEletricidade && (
                            <div>
                              Preço:{" "}
                              {formatCurrency(expense.precoKwhEletricidade)}/kWh
                            </div>
                          )}
                        </div>
                      )}

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Vencimento: {formatDate(expense.dataVencimento)}
                      </span>
                      {expense.status === "PAGO" && expense.dataPagamento && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Pago em: {formatDate(expense.dataPagamento)}
                        </span>
                      )}
                    </div>

                    {expense.observacoes && (
                      <div className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                        <strong>Observações:</strong> {expense.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    {/* Valor */}
                    {editingExpense === expense.id ? (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 text-right"
                        />
                        <Input
                          placeholder="Observações"
                          value={editObservations}
                          onChange={(e) => setEditObservations(e.target.value)}
                          className="w-48"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleAdjustValue(expense.id)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="text-xl font-bold">
                            {formatCurrency(expense.valorFinal)}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(expense)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
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
                    )}

                    {/* Status Action Buttons */}
                    {editingExpense !== expense.id && (
                      <div className="flex flex-col gap-2 mt-3">
                        {expense.status === "PENDENTE" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateExpenseStatus(expense.id, "PAGO")
                            }
                            disabled={loadingExpenseIds.has(expense.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {loadingExpenseIds.has(expense.id)
                              ? "..."
                              : "Marcar como Pago"}
                          </Button>
                        )}

                        {expense.status === "PAGO" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateExpenseStatus(expense.id, "PENDENTE")
                            }
                            disabled={loadingExpenseIds.has(expense.id)}
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          >
                            {loadingExpenseIds.has(expense.id)
                              ? "..."
                              : "Marcar como Pendente"}
                          </Button>
                        )}

                        {(expense.status === "PENDENTE" ||
                          expense.status === "PAGO") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateExpenseStatus(expense.id, "VENCIDO")
                            }
                            disabled={loadingExpenseIds.has(expense.id)}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            {loadingExpenseIds.has(expense.id)
                              ? "..."
                              : "Marcar como Vencido"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
