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
import { Plus, FileText } from "lucide-react";
import { addContract } from "@/lib/actions/landlord";

interface Property {
  id: string;
  nome: string;
  endereco: string;
  valorRenda: number;
  ativa: boolean | null;
}

interface Contract {
  id: string;
  propriedadeId: string;
  inquilinoId: string;
  valorRenda: number;
  dataInicio: Date | string;
  dataFim: Date | string | null;
  diaVencimento: number;
  propriedadeNome: string;
  propriedadeEndereco: string;
  inquilinoNome: string;
  inquilinoEmail: string;
}

interface ContractsTabProps {
  properties: Property[];
  contracts: Contract[];
  showAddContract: boolean;
  onToggleAddContract: () => void;
}

const ContractsTab: React.FC<ContractsTabProps> = ({
  properties,
  contracts,
  showAddContract,
  onToggleAddContract,
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

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const resetContractForm = () => {
    setContractForm({
      propriedadeId: "",
      inquilinoEmail: "",
      dataInicio: "",
      dataFim: "",
      valorRenda: "",
      diaVencimento: "5",
    });
  };

  const getAvailableProperties = () => {
    const propertiesWithContracts = contracts.map((c) => c.propriedadeId);
    return properties.filter(
      (p) => (p.ativa ?? true) && !propertiesWithContracts.includes(p.id),
    );
  };

  const handleAddContract = async () => {
    if (
      !contractForm.propriedadeId ||
      !contractForm.inquilinoEmail ||
      !contractForm.dataInicio ||
      !contractForm.valorRenda
    ) {
      alert("Todos os campos obrigatórios devem ser preenchidos");
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
        onToggleAddContract();
        resetContractForm();
        window.location.reload();
      } else {
        alert(result.error || "Erro ao criar contrato");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-600">
          Contratos Ativos
        </h2>
        <Button
          onClick={onToggleAddContract}
          disabled={getAvailableProperties().length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showAddContract ? "Cancelar" : "Novo Contrato"}
        </Button>
      </div>

      {/* No Available Properties Message */}
      {getAvailableProperties().length === 0 && !showAddContract && (
        <Card className="mb-6">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">
              Todas as suas propriedades já têm contratos ativos ou você não tem
              propriedades disponíveis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Contract Form */}
      {showAddContract && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Novo Contrato</CardTitle>
            <CardDescription>
              Associe um inquilino a uma propriedade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Propriedade *</Label>
                <select
                  value={contractForm.propriedadeId}
                  onChange={(e) => {
                    const selectedProperty = properties.find(
                      (p) => p.id === e.target.value,
                    );
                    setContractForm((prev) => ({
                      ...prev,
                      propriedadeId: e.target.value,
                      valorRenda: selectedProperty
                        ? selectedProperty.valorRenda.toString()
                        : "",
                    }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma propriedade</option>
                  {getAvailableProperties().map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.nome} - {property.endereco}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Email do Inquilino *</Label>
                <Input
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
              </div>
              <div>
                <Label>Data de Início *</Label>
                <Input
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
                <Label>Data de Fim</Label>
                <Input
                  type="date"
                  value={contractForm.dataFim}
                  onChange={(e) =>
                    setContractForm((prev) => ({
                      ...prev,
                      dataFim: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Valor da Renda (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={contractForm.valorRenda}
                  onChange={(e) =>
                    setContractForm((prev) => ({
                      ...prev,
                      valorRenda: e.target.value,
                    }))
                  }
                  placeholder="650.00"
                />
              </div>
              <div>
                <Label>Dia de Vencimento *</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={contractForm.diaVencimento}
                  onChange={(e) =>
                    setContractForm((prev) => ({
                      ...prev,
                      diaVencimento: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddContract} disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Contrato"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onToggleAddContract();
                  resetContractForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ainda não tem contratos
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Crie contratos para associar inquilinos às suas propriedades.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {contract.propriedadeNome}
                    </h3>
                    <p className="text-gray-600">
                      {contract.propriedadeEndereco}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>Inquilino:</strong> {contract.inquilinoNome} (
                      {contract.inquilinoEmail})
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>Início: {formatDate(contract.dataInicio)}</span>
                      {contract.dataFim && (
                        <span>Fim: {formatDate(contract.dataFim)}</span>
                      )}
                      <span>Vencimento: Dia {contract.diaVencimento}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(contract.valorRenda)}
                    </div>
                    <Badge variant="default">Ativo</Badge>
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

export default ContractsTab;
