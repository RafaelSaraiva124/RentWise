import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Droplets, Zap, Calculator, Info, AlertCircle } from "lucide-react";
import { addWaterExpense, addElectricityExpense } from "@/lib/actions/expenses";

interface Contract {
  id: string;
  propriedadeId: string;
  propriedadeNome: string;
  inquilinoNome: string;
  diaVencimento: number;
}

interface AddExpenseFormProps {
  contracts: Contract[];
  expenseType: "AGUA" | "ELETRICIDADE";
  selectedPropertyId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  contracts,
  expenseType,
  selectedPropertyId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contratoId: "",
    leituraAnterior: "",
    leituraAtual: "",
    preco: expenseType === "AGUA" ? "0.60" : "0.15", // Preços padrão PT
    taxaFixa: expenseType === "AGUA" ? "5.00" : "15.00", // Taxas padrão PT
    mesReferencia: "",
    dataVencimento: "",
    descricao: "",
  });

  const [calculatedValue, setCalculatedValue] = useState(0);
  const [consumption, setConsumption] = useState(0);

  // Auto-selecionar contrato se propertyId fornecido
  useEffect(() => {
    if (selectedPropertyId) {
      const contract = contracts.find(
        (c) => c.propriedadeId === selectedPropertyId,
      );
      if (contract) {
        setFormData((prev) => ({
          ...prev,
          contratoId: contract.id,
          mesReferencia: getCurrentMonth(),
          dataVencimento: getDefaultDueDate(contract),
        }));
      }
    }
  }, [selectedPropertyId, contracts]);

  // Recalcular quando os valores mudarem
  useEffect(() => {
    const anterior = parseFloat(formData.leituraAnterior) || 0;
    const atual = parseFloat(formData.leituraAtual) || 0;
    const preco = parseFloat(formData.preco) || 0;
    const taxa = parseFloat(formData.taxaFixa) || 0;

    const consumoCalculado = atual - anterior;
    const valorCalculado =
      consumoCalculado > 0 ? consumoCalculado * preco + taxa : 0;

    setConsumption(consumoCalculado);
    setCalculatedValue(valorCalculado);
  }, [
    formData.leituraAnterior,
    formData.leituraAtual,
    formData.preco,
    formData.taxaFixa,
  ]);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const getDefaultDueDate = (contract: Contract) => {
    const now = new Date();
    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      contract.diaVencimento || 5,
    );
    return nextMonth.toISOString().split("T")[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContractChange = (contratoId: string) => {
    const contract = contracts.find((c) => c.id === contratoId);
    setFormData((prev) => ({
      ...prev,
      contratoId,
      dataVencimento: contract ? getDefaultDueDate(contract) : "",
    }));
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.contratoId) {
      alert("Selecione um contrato");
      return;
    }

    if (!formData.leituraAnterior || !formData.leituraAtual) {
      alert("Preencha as leituras anterior e atual");
      return;
    }

    if (
      parseFloat(formData.leituraAtual) < parseFloat(formData.leituraAnterior)
    ) {
      alert("A leitura atual não pode ser menor que a anterior");
      return;
    }

    if (!formData.mesReferencia || !formData.dataVencimento) {
      alert("Preencha o mês de referência e data de vencimento");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();

      // Adaptar nomes dos campos conforme o tipo
      form.append("contratoId", formData.contratoId);
      form.append("leituraAnterior", formData.leituraAnterior);
      form.append("leituraAtual", formData.leituraAtual);
      form.append("taxaFixa", formData.taxaFixa);
      form.append("mesReferencia", formData.mesReferencia);
      form.append("dataVencimento", formData.dataVencimento);
      form.append("descricao", formData.descricao);

      if (expenseType === "AGUA") {
        form.append("precoM3", formData.preco);
      } else {
        form.append("precoKwh", formData.preco);
      }

      const result =
        expenseType === "AGUA"
          ? await addWaterExpense(form)
          : await addElectricityExpense(form);

      if (result.success) {
        alert(result.message || "Despesa adicionada com sucesso!");
        onSuccess();
      } else {
        alert(result.error || "Erro ao adicionar despesa");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isWater = expenseType === "AGUA";
  const icon = isWater ? (
    <Droplets className="h-5 w-5 text-blue-600" />
  ) : (
    <Zap className="h-5 w-5 text-yellow-600" />
  );
  const title = isWater
    ? "Adicionar Despesa de Água"
    : "Adicionar Despesa de Eletricidade";
  const unit = isWater ? "m³" : "kWh";
  const priceLabel = isWater ? "Preço por m³ (€)" : "Preço por kWh (€)";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          Insira as leituras para calcular automaticamente o valor a pagar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Contrato */}
        <div>
          <Label>Contrato / Propriedade *</Label>
          <select
            value={formData.contratoId}
            onChange={(e) => handleContractChange(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!!selectedPropertyId}
          >
            <option value="">Selecione um contrato</option>
            {contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.propriedadeNome} - {contract.inquilinoNome}
              </option>
            ))}
          </select>
        </div>

        {/* Leituras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Leitura Anterior ({unit}) *</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.leituraAnterior}
              onChange={(e) =>
                handleInputChange("leituraAnterior", e.target.value)
              }
              placeholder="0.000"
            />
          </div>
          <div>
            <Label>Leitura Atual ({unit}) *</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.leituraAtual}
              onChange={(e) =>
                handleInputChange("leituraAtual", e.target.value)
              }
              placeholder="0.000"
            />
          </div>
        </div>

        {/* Consumo Calculado */}
        {consumption > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">
                Consumo: {consumption.toFixed(3)} {unit}
              </span>
            </div>
          </div>
        )}

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{priceLabel} *</Label>
            <Input
              type="number"
              step="0.0001"
              value={formData.preco}
              onChange={(e) => handleInputChange("preco", e.target.value)}
              placeholder={isWater ? "0.6000" : "0.1500"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Preço médio em Portugal: {isWater ? "€0,60/m³" : "€0,15/kWh"}
            </p>
          </div>
          <div>
            <Label>Taxa Fixa Mensal (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.taxaFixa}
              onChange={(e) => handleInputChange("taxaFixa", e.target.value)}
              placeholder={isWater ? "5.00" : "15.00"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Taxa típica: {isWater ? "€5-10/mês" : "€15-25/mês"}
            </p>
          </div>
        </div>

        {/* Valor Calculado */}
        {calculatedValue > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-800">
                <Calculator className="h-5 w-5" />
                <span className="font-medium">Valor Calculado:</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">
                  {formatCurrency(calculatedValue)}
                </div>
                <div className="text-sm text-green-600">
                  {consumption.toFixed(3)} {unit} ×{" "}
                  {formatCurrency(parseFloat(formData.preco))} + taxa fixa
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Mês de Referência *</Label>
            <Input
              type="month"
              value={formData.mesReferencia}
              onChange={(e) =>
                handleInputChange("mesReferencia", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Data de Vencimento *</Label>
            <Input
              type="date"
              value={formData.dataVencimento}
              onChange={(e) =>
                handleInputChange("dataVencimento", e.target.value)
              }
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <Label>Descrição (opcional)</Label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => handleInputChange("descricao", e.target.value)}
            placeholder={`Despesa de ${isWater ? "água" : "eletricidade"} - ${formData.mesReferencia}`}
            rows={3}
          />
        </div>

        {/* Avisos */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Dica:</p>
              <p>
                O valor é calculado automaticamente baseado no consumo e preços
                inseridos. Pode ajustar manualmente após criar a despesa se
                necessário.
              </p>
            </div>
          </div>

          {consumption < 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Erro:</p>
                <p>
                  A leitura atual não pode ser menor que a anterior. Verifique
                  os valores inseridos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || calculatedValue <= 0 || consumption < 0}
            className="flex-1"
          >
            {isSubmitting
              ? "Adicionando..."
              : `Adicionar Despesa ${formatCurrency(calculatedValue)}`}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddExpenseForm;
