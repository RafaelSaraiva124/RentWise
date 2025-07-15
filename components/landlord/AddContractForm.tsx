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
import { ClipboardList, Home, User } from "lucide-react";
import { addContract } from "@/lib/actions/landlord";

interface Property {
  id: string;
  nome: string;
  endereco: string;
  valorRenda: number;
  ativa: boolean;
}

interface AddContractFormProps {
  properties: Property[];
  onSuccess?: () => void;
  onCancel?: () => void;
  showAsCard?: boolean;
}

const AddContractForm: React.FC<AddContractFormProps> = ({
  properties,
  onSuccess,
  onCancel,
  showAsCard = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractForm, setContractForm] = useState({
    propriedadeId: "",
    inquilinoEmail: "",
    dataInicio: "",
    dataFim: "",
    valorRenda: "",
    diaVencimento: "5",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const resetForm = () => {
    setContractForm({
      propriedadeId: "",
      inquilinoEmail: "",
      dataInicio: "",
      dataFim: "",
      valorRenda: "",
      diaVencimento: "5",
    });
  };

  const handlePropertyChange = (propertyId: string) => {
    const selectedProperty = properties.find((p) => p.id === propertyId);
    setContractForm((prev) => ({
      ...prev,
      propriedadeId: propertyId,
      valorRenda: selectedProperty
        ? selectedProperty.valorRenda.toString()
        : "",
    }));
  };

  const handleAddContract = async () => {
    const {
      propriedadeId,
      inquilinoEmail,
      dataInicio,
      valorRenda,
      diaVencimento,
    } = contractForm;

    if (
      !propriedadeId ||
      !inquilinoEmail ||
      !dataInicio ||
      !valorRenda ||
      !diaVencimento
    ) {
      alert("Todos os campos obrigatórios devem ser preenchidos");
      return;
    }

    if (isNaN(parseFloat(valorRenda)) || parseFloat(valorRenda) <= 0) {
      alert("Valor da renda deve ser um número positivo");
      return;
    }

    if (
      isNaN(parseInt(diaVencimento)) ||
      parseInt(diaVencimento) < 1 ||
      parseInt(diaVencimento) > 31
    ) {
      alert("Dia de vencimento deve ser entre 1 e 31");
      return;
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquilinoEmail)) {
      alert("Por favor, insira um email válido");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(contractForm).forEach(([key, value]) => {
        form.append(key, value);
      });

      const result = await addContract(form);
      if (result.success) {
        alert("Contrato criado com sucesso!");
        resetForm();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao criar contrato");
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

  const selectedProperty = properties.find(
    (p) => p.id === contractForm.propriedadeId,
  );
  const availableProperties = properties.filter((p) => p.ativa);

  const formContent = (
    <div className="space-y-4">
      {/* Verificar se há propriedades */}
      {availableProperties.length === 0 ? (
        <div className="text-center py-8">
          <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">
            Você precisa ter propriedades ativas para criar contratos.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Adicione uma propriedade primeiro no menu de propriedades.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="contract-property">Propriedade *</Label>
              <select
                id="contract-property"
                value={contractForm.propriedadeId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma propriedade</option>
                {availableProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.nome} - {property.endereco} (
                    {formatCurrency(property.valorRenda)})
                  </option>
                ))}
              </select>
              {selectedProperty && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700 font-medium">
                    {selectedProperty.nome}
                  </p>
                  <p className="text-sm text-blue-600">
                    {selectedProperty.endereco}
                  </p>
                  <p className="text-sm text-blue-600">
                    Renda sugerida:{" "}
                    {formatCurrency(selectedProperty.valorRenda)}
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="contract-email">Email do Inquilino *</Label>
              <Input
                id="contract-email"
                type="email"
                value={contractForm.inquilinoEmail}
                onChange={(e) =>
                  setContractForm((prev) => ({
                    ...prev,
                    inquilinoEmail: e.target.value,
                  }))
                }
                placeholder="inquilino@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                O inquilino deve estar registado no sistema com este email
              </p>
            </div>

            <div>
              <Label htmlFor="contract-start">Data de Início *</Label>
              <Input
                id="contract-start"
                type="date"
                value={contractForm.dataInicio}
                onChange={(e) =>
                  setContractForm((prev) => ({
                    ...prev,
                    dataInicio: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="contract-end">Data de Fim</Label>
              <Input
                id="contract-end"
                type="date"
                value={contractForm.dataFim}
                onChange={(e) =>
                  setContractForm((prev) => ({
                    ...prev,
                    dataFim: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio para contrato por tempo indeterminado
              </p>
            </div>

            <div>
              <Label htmlFor="contract-rent">Valor da Renda (€) *</Label>
              <Input
                id="contract-rent"
                type="number"
                step="0.01"
                value={contractForm.valorRenda}
                onChange={(e) =>
                  setContractForm((prev) => ({
                    ...prev,
                    valorRenda: e.target.value,
                  }))
                }
                placeholder="750.00"
              />
            </div>

            <div>
              <Label htmlFor="contract-due">Dia de Vencimento *</Label>
              <select
                id="contract-due"
                value={contractForm.diaVencimento}
                onChange={(e) =>
                  setContractForm((prev) => ({
                    ...prev,
                    diaVencimento: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day.toString()}>
                    Dia {day}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Dia do mês em que a renda vence
              </p>
            </div>
          </div>

          {contractForm.valorRenda && (
            <div className="p-4 bg-green-50 rounded-md">
              <h4 className="font-medium text-green-800 mb-2">
                Resumo do Contrato
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>Propriedade:</strong> {selectedProperty?.nome}
                </p>
                <p>
                  <strong>Email do Inquilino:</strong>{" "}
                  {contractForm.inquilinoEmail}
                </p>
                <p>
                  <strong>Valor da Renda:</strong>{" "}
                  {formatCurrency(parseFloat(contractForm.valorRenda))}
                </p>
                <p>
                  <strong>Vencimento:</strong> Dia {contractForm.diaVencimento}{" "}
                  de cada mês
                </p>
                {contractForm.dataInicio && (
                  <p>
                    <strong>Início:</strong>{" "}
                    {new Date(contractForm.dataInicio).toLocaleDateString(
                      "pt-PT",
                    )}
                  </p>
                )}
                {contractForm.dataFim && (
                  <p>
                    <strong>Fim:</strong>{" "}
                    {new Date(contractForm.dataFim).toLocaleDateString("pt-PT")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddContract} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Contrato"}
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
          <ClipboardList className="h-5 w-5" />
          Criar Novo Contrato
        </CardTitle>
        <CardDescription>
          Crie um contrato de arrendamento entre uma propriedade e um inquilino
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default AddContractForm;
