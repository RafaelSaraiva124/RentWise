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
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Euro } from "lucide-react";
import { addRent } from "@/lib/actions/landlord";

interface Contract {
  id: string;
  propriedadeNome: string;
  inquilinoNome: string;
  valorRenda: number;
  diaVencimento: number;
}

interface AddRentFormProps {
  contracts: Contract[];
  onSuccess?: () => void;
  onCancel?: () => void;
  showAsCard?: boolean;
}

const AddRentForm: React.FC<AddRentFormProps> = ({
  contracts,
  onSuccess,
  onCancel,
  showAsCard = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rentForm, setRentForm] = useState({
    contratoId: "",
    mesReferencia: "",
    dataVencimento: "",
    descricao: "",
  });

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const resetForm = () => {
    setRentForm({
      contratoId: "",
      mesReferencia: "",
      dataVencimento: "",
      descricao: "",
    });
  };

  const handleAddRent = async () => {
    const { contratoId, mesReferencia, dataVencimento } = rentForm;

    if (!contratoId || !mesReferencia || !dataVencimento) {
      alert(
        "Contrato, mês de referência e data de vencimento são obrigatórios",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(rentForm).forEach(([key, value]) => {
        form.append(key, value);
      });

      const result = await addRent(form);
      if (result.success) {
        alert("Renda adicionada com sucesso!");
        resetForm();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao adicionar renda");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const handleContractChange = (contratoId: string) => {
    const selectedContract = contracts.find((c) => c.id === contratoId);
    setRentForm((prev) => ({
      ...prev,
      contratoId,
      mesReferencia: getCurrentMonth(),
      dataVencimento: selectedContract
        ? getDefaultDueDate(selectedContract)
        : "",
    }));
  };

  const selectedContract = contracts.find((c) => c.id === rentForm.contratoId);

  const formContent = (
    <div className="space-y-4">
      {/* Verificar se há contratos */}
      {contracts.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">
            Você precisa ter contratos ativos para adicionar rendas.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="rent-contract">Contrato *</Label>
              <select
                id="rent-contract"
                value={rentForm.contratoId}
                onChange={(e) => handleContractChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um contrato</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.propriedadeNome} - {contract.inquilinoNome} (
                    {formatCurrency(contract.valorRenda)})
                  </option>
                ))}
              </select>
              {selectedContract && (
                <div className="mt-2 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700 font-medium">
                    Valor da Renda:{" "}
                    {formatCurrency(selectedContract.valorRenda)}
                  </p>
                  <p className="text-sm text-green-600">
                    Dia de Vencimento: {selectedContract.diaVencimento}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="rent-month">Mês de Referência *</Label>
              <Input
                id="rent-month"
                type="month"
                value={rentForm.mesReferencia}
                onChange={(e) =>
                  setRentForm((prev) => ({
                    ...prev,
                    mesReferencia: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Mês ao qual se refere esta renda
              </p>
            </div>

            <div>
              <Label htmlFor="rent-due">Data de Vencimento *</Label>
              <Input
                id="rent-due"
                type="date"
                value={rentForm.dataVencimento}
                onChange={(e) =>
                  setRentForm((prev) => ({
                    ...prev,
                    dataVencimento: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Data limite para pagamento
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="rent-desc">Descrição (opcional)</Label>
              <Textarea
                id="rent-desc"
                value={rentForm.descricao}
                onChange={(e) =>
                  setRentForm((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
                placeholder="Ex: Renda de Janeiro 2025"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddRent} disabled={isSubmitting}>
              {isSubmitting ? "Adicionando..." : "Adicionar Renda"}
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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Adicionar Nova Renda
        </CardTitle>
        <CardDescription>
          Crie uma nova cobrança de renda baseada num contrato existente
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default AddRentForm;
