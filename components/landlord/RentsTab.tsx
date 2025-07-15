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
  Euro,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { addRent, updateRentStatus } from "@/lib/actions/landlord";

interface Contract {
  id: string;
  propriedadeNome: string;
  inquilinoNome: string;
  valorRenda: number;
  diaVencimento: number;
}

interface Rent {
  id: string;
  contratoId: string;
  propriedadeId: string;
  inquilinoId: string;
  senhorioId: string;
  valor: number;
  mesReferencia: string;
  dataVencimento: Date | string;
  dataPagamento: Date | string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO" | null;
  descricao: string | null;
  createdAt: Date | null;
  propriedadeNome: string;
  propriedadeEndereco: string;
  inquilinoNome: string;
  inquilinoEmail: string;
}

interface RentsTabProps {
  contracts: Contract[];
  rents: Rent[];
  showAddRent: boolean;
  onToggleAddRent: () => void;
}

const RentsTab: React.FC<RentsTabProps> = ({
  contracts,
  rents,
  showAddRent,
  onToggleAddRent,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRentIds, setLoadingRentIds] = useState<Set<string>>(new Set());
  const [rentForm, setRentForm] = useState({
    contratoId: "",
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

  const resetRentForm = () => {
    setRentForm({
      contratoId: "",
      mesReferencia: "",
      dataVencimento: "",
      descricao: "",
    });
  };

  const handleAddRent = async () => {
    if (
      !rentForm.contratoId ||
      !rentForm.mesReferencia ||
      !rentForm.dataVencimento
    ) {
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
        onToggleAddRent();
        resetRentForm();
        window.location.reload();
      } else {
        alert(result.error || "Erro ao adicionar renda");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRentStatus = async (
    rentId: string,
    newStatus: "PAGO" | "PENDENTE" | "VENCIDO",
  ) => {
    setLoadingRentIds((prev) => new Set(prev).add(rentId));

    try {
      const result = await updateRentStatus(rentId, newStatus);

      if (result.success) {
        alert(
          result.message || `Renda marcada como ${newStatus.toLowerCase()}`,
        );
        window.location.reload();
      } else {
        alert(result.error || "Erro ao atualizar status da renda");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setLoadingRentIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rentId);
        return newSet;
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-600">
          Gestão de Rendas
        </h2>
        <Button
          onClick={() => {
            onToggleAddRent();
            if (!showAddRent) {
              setRentForm((prev) => ({
                ...prev,
                mesReferencia: getCurrentMonth(),
                dataVencimento: getDefaultDueDate(),
              }));
            }
          }}
          disabled={contracts.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showAddRent ? "Cancelar" : "Gerar Renda"}
        </Button>
      </div>

      {/* No Contracts Message */}
      {contracts.length === 0 && (
        <Card className="mb-6">
          <CardContent className="text-center py-8">
            <Euro className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">
              Você precisa ter contratos ativos para gerar rendas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Rent Form */}
      {showAddRent && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gerar Nova Renda</CardTitle>
            <CardDescription>
              Crie uma nova renda baseada num contrato existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contrato *</Label>
                <select
                  value={rentForm.contratoId}
                  onChange={(e) => {
                    const selectedContract = contracts.find(
                      (c) => c.id === e.target.value,
                    );
                    setRentForm((prev) => ({
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
                      {contract.propriedadeNome} - {contract.inquilinoNome} (
                      {formatCurrency(contract.valorRenda)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Mês de Referência *</Label>
                <Input
                  type="month"
                  value={rentForm.mesReferencia}
                  onChange={(e) =>
                    setRentForm((prev) => ({
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
                  value={rentForm.dataVencimento}
                  onChange={(e) =>
                    setRentForm((prev) => ({
                      ...prev,
                      dataVencimento: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={rentForm.descricao}
                  onChange={(e) =>
                    setRentForm((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  placeholder="Renda de Janeiro 2024"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddRent} disabled={isSubmitting}>
                {isSubmitting ? "Gerando..." : "Gerar Renda"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onToggleAddRent();
                  resetRentForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rents List */}
      {rents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Euro className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ainda não há rendas registadas
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Gere rendas mensais baseadas nos seus contratos ativos.
            </p>
            {contracts.length > 0 && (
              <Button onClick={onToggleAddRent}>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Primeira Renda
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rents.map((rent) => (
            <Card key={rent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        {rent.descricao || `Renda ${rent.mesReferencia}`}
                      </h3>
                      <Badge className={getStatusColor(rent.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(rent.status)}
                          {rent.status || "INDEFINIDO"}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-gray-600 font-medium">
                      {rent.propriedadeNome}
                    </p>
                    <p className="text-sm text-gray-500">
                      {rent.propriedadeEndereco}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Inquilino:</strong> {rent.inquilinoNome}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Vencimento: {formatDate(rent.dataVencimento)}
                      </span>
                      {rent.status === "PAGO" && rent.dataPagamento && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Pago em: {formatDate(rent.dataPagamento)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold">
                      {formatCurrency(rent.valor)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {rent.mesReferencia}
                    </p>

                    {/* Status Action Buttons */}
                    <div className="flex flex-col gap-2 mt-3">
                      {rent.status === "PENDENTE" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateRentStatus(rent.id, "PAGO")
                          }
                          disabled={loadingRentIds.has(rent.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {loadingRentIds.has(rent.id)
                            ? "..."
                            : "Marcar como Pago"}
                        </Button>
                      )}

                      {rent.status === "PAGO" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateRentStatus(rent.id, "PENDENTE")
                          }
                          disabled={loadingRentIds.has(rent.id)}
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        >
                          {loadingRentIds.has(rent.id)
                            ? "..."
                            : "Marcar como Pendente"}
                        </Button>
                      )}

                      {(rent.status === "PENDENTE" ||
                        rent.status === "PAGO") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateRentStatus(rent.id, "VENCIDO")
                          }
                          disabled={loadingRentIds.has(rent.id)}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          {loadingRentIds.has(rent.id)
                            ? "..."
                            : "Marcar como Vencido"}
                        </Button>
                      )}
                    </div>
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

export default RentsTab;
