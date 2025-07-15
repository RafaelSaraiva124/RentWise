import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Building } from "lucide-react";
import { addProperty } from "@/lib/actions/landlord";

interface AddPropertyFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    descricao: "",
    valorRenda: "",
  });

  const [errors, setErrors] = useState({
    nome: "",
    endereco: "",
    valorRenda: "",
  });

  const validateForm = () => {
    const newErrors = {
      nome: "",
      endereco: "",
      valorRenda: "",
    };

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome da propriedade é obrigatório";
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = "Endereço é obrigatório";
    }

    if (!formData.valorRenda.trim()) {
      newErrors.valorRenda = "Valor da renda é obrigatório";
    } else if (
      isNaN(parseFloat(formData.valorRenda)) ||
      parseFloat(formData.valorRenda) <= 0
    ) {
      newErrors.valorRenda = "Valor da renda deve ser um número positivo";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      const result = await addProperty(form);
      if (result.success) {
        alert("Propriedade adicionada com sucesso!");
        onSuccess();
        onClose();
      } else {
        alert(result.error || "Erro ao adicionar propriedade");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro quando o usuário começar a digitar
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <CardTitle>Nova Propriedade</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Propriedade *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Ex: Apartamento T2 Centro"
              className={errors.nome ? "border-red-500" : ""}
              required
            />
            {errors.nome && (
              <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              placeholder="Rua, número, código postal, cidade"
              className={errors.endereco ? "border-red-500" : ""}
              required
            />
            {errors.endereco && (
              <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>
            )}
          </div>

          <div>
            <Label htmlFor="valorRenda">Valor da Renda (€) *</Label>
            <Input
              id="valorRenda"
              type="number"
              step="0.01"
              min="0"
              value={formData.valorRenda}
              onChange={(e) => handleInputChange("valorRenda", e.target.value)}
              placeholder="500.00"
              className={errors.valorRenda ? "border-red-500" : ""}
              required
            />
            {errors.valorRenda && (
              <p className="text-red-500 text-xs mt-1">{errors.valorRenda}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição adicional da propriedade..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional: Adicione detalhes como número de quartos,
              características especiais, etc.
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adicionando...
                </>
              ) : (
                <>
                  <Building className="h-4 w-4 mr-2" />
                  Adicionar Propriedade
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPropertyForm;
