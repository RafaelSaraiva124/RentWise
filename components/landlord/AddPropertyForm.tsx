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
import { addProperty } from "@/lib/actions/landlord";

interface AddPropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showAsCard?: boolean;
}

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  onSuccess,
  onCancel,
  showAsCard = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    nome: "",
    endereco: "",
    descricao: "",
    valorRenda: "",
  });

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
        resetPropertyForm();
        onSuccess?.();
      } else {
        alert(result.error || "Erro ao adicionar propriedade");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetPropertyForm();
    onCancel?.();
  };

  const formContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={propertyForm.nome}
            onChange={(e) =>
              setPropertyForm((p) => ({ ...p, nome: e.target.value }))
            }
            placeholder="Ex: T2 no centro"
          />
        </div>
        <div>
          <Label htmlFor="valorRenda">Valor da Renda *</Label>
          <Input
            id="valorRenda"
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
          <Label htmlFor="endereco">Endereço *</Label>
          <Input
            id="endereco"
            value={propertyForm.endereco}
            onChange={(e) =>
              setPropertyForm((p) => ({ ...p, endereco: e.target.value }))
            }
            placeholder="Rua Exemplo, Lisboa"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
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
          {isSubmitting ? "A adicionar..." : "Adicionar Propriedade"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );

  if (!showAsCard) {
    return formContent;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Adicionar Nova Propriedade</CardTitle>
        <CardDescription>
          Preencha os detalhes da nova propriedade
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default AddPropertyForm;
