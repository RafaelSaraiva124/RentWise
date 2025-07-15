"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Receipt, Droplets, Zap, X, ClipboardList } from "lucide-react";
import AddPropertyForm from "./AddPropertyForm";
import AddExpenseForm from "./AddExpenseForm";
import AddRentForm from "./AddRentForm";
import AddContractForm from "./AddContractForm";

type QuickActionType =
  | "property"
  | "rent"
  | "water"
  | "electricity"
  | "contract"
  | null;

interface QuickActionsProps {
  properties?: any[];
  contracts?: any[];
  onSuccess?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  properties = [],
  contracts = [],
  onSuccess,
}) => {
  const [activeAction, setActiveAction] = useState<QuickActionType>(null);

  const quickActions = [
    {
      id: "property" as const,
      title: "Nova Propriedade",
      description: "Adicionar imóvel",
      icon: Home,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "contract" as const,
      title: "Novo Contrato",
      description: "Criar contrato",
      icon: ClipboardList,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "rent" as const,
      title: "Nova Renda",
      description: "Registar cobrança",
      icon: Receipt,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "water" as const,
      title: "Despesas",
      description: "Registar consumos",
      icon: Droplets,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
    },
  ];

  const handleActionClick = (actionId: QuickActionType) => {
    setActiveAction(actionId);
  };

  const handleClose = () => {
    setActiveAction(null);
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess?.();
  };

  const renderActionContent = () => {
    switch (activeAction) {
      case "property":
        return (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nova Propriedade</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AddPropertyForm
              onSuccess={handleSuccess}
              onCancel={handleClose}
              showAsCard={true}
            />
          </div>
        );
      case "contract":
        return (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Novo Contrato</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AddContractForm
              properties={properties}
              onSuccess={handleSuccess}
              onCancel={handleClose}
              showAsCard={true}
            />
          </div>
        );
      case "rent":
        return (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nova Renda</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AddRentForm
              contracts={contracts}
              onSuccess={handleSuccess}
              onCancel={handleClose}
              showAsCard={true}
            />
          </div>
        );
      case "water":
      case "electricity":
        return (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {activeAction === "water"
                  ? "Despesa de Água"
                  : "Despesa Elétrica"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AddExpenseForm
              contracts={contracts}
              onSuccess={handleSuccess}
              onCancel={handleClose}
              showAsCard={true}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>

      {/* Formulário ativo */}
      {activeAction && renderActionContent()}

      {/* Grid de ações */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleActionClick(action.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-3">
                <div
                  className={`w-12 h-12 ${action.bgColor} rounded-full flex items-center justify-center mx-auto`}
                >
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
