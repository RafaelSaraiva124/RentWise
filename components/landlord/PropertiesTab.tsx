"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building } from "lucide-react";
import { addProperty } from "@/lib/actions/landlord";

interface Property {
  id: string;
  nome: string;
  endereco: string;
  descricao: string | null;
  valorRenda: number;
  ativa: boolean | null;
  createdAt: Date | null;
}

interface Contract {
  id: string;
  propriedadeId: string;
}

interface PropertiesTabProps {
  properties: Property[];
  contracts: Contract[];
  showAddProperty: boolean;
  onToggleAddProperty: () => void;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  properties,
  contracts,
  showAddProperty,
  onToggleAddProperty,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    nome: "",
    endereco: "",
    descricao: "",
    valorRenda: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const resetPropertyForm = () => {
    setPropertyForm({ nome: "", endereco: "", descricao: "", valorRenda: "" });
  };

  const handleAddProperty = async () => {
    if (
      !propertyForm.nome ||
      !propertyForm.endereco ||
      !propertyForm.valorRenda
    ) {
      alert("Nome, endereço e valor da renda são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(propertyForm).forEach(([key, value]) => {
        form.append(key, value);
      });

      const result = await addProperty(form);
      if (result.success) {
        alert("Propriedade adicionada com sucesso!");
        onToggleAddProperty();
        resetPropertyForm();
        window.location.reload();
      } else {
        alert(result.error || "Erro ao adicionar propriedade");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-800">Minhas Propriedades</h2>
        <Button onClick={onToggleAddProperty} variant="default">
          <Plus className="h-4 w-4 mr-2" />
          {showAddProperty ? "Cancelar" : "Nova Propriedade"}
        </Button>
      </div>

      {showAddProperty && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Adicionar Propriedade</CardTitle>
            <CardDescription>
              Preencha os detalhes da nova propriedade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={propertyForm.nome}
                  onChange={(e) =>
                    setPropertyForm((p) => ({ ...p, nome: e.target.value }))
                  }
                  placeholder="Ex: T2 no centro"
                />
              </div>
              <div>
                <Label>Valor da Renda *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={propertyForm.valorRenda}
                  onChange={(e) =>
                    setPropertyForm((p) => ({
                      ...p,
                      valorRenda: e.target.value,
                    }))
                  }
                  placeholder="Ex: 700.00"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Endereço *</Label>
                <Input
                  value={propertyForm.endereco}
                  onChange={(e) =>
                    setPropertyForm((p) => ({ ...p, endereco: e.target.value }))
                  }
                  placeholder="Rua Exemplo, Lisboa"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  value={propertyForm.descricao || ""}
                  onChange={(e) =>
                    setPropertyForm((p) => ({
                      ...p,
                      descricao: e.target.value,
                    }))
                  }
                  placeholder="Detalhes adicionais..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={handleAddProperty} disabled={isSubmitting}>
                {isSubmitting ? "A adicionar..." : "Adicionar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onToggleAddProperty();
                  resetPropertyForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-16 w-16 mx-auto mb-4 text-zinc-300" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma propriedade registada
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              Adicione a primeira propriedade para começar a gerir rendas.
            </p>
            <Button onClick={onToggleAddProperty}>
              <Plus className="h-4 w-4 mr-2" /> Nova Propriedade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const hasContract = contracts.some(
              (c) => c.propriedadeId === property.id,
            );
            return (
              <Card
                key={property.id}
                onClick={() => router.push(`/properties/${property.id}`)}
                className="hover:shadow-lg transition"
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{property.nome}</span>
                    <div className="flex gap-1">
                      <Badge variant={property.ativa ? "default" : "secondary"}>
                        {property.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                      {hasContract && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700"
                        >
                          Alugada
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                    {property.endereco}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Valor da Renda:</span>
                    <span className="font-medium">
                      {formatCurrency(property.valorRenda)}
                    </span>
                  </div>
                  {property.descricao && (
                    <p className="text-sm text-zinc-500 line-clamp-3">
                      {property.descricao}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;
