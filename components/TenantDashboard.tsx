"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Euro,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  User,
} from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "INQUILINO" | "SENHORIO" | null;
  status: "INDEFINIDO" | "PENDING" | "APPROVED" | "REJECTED" | null;
}

interface Rent {
  id: string;
  inquilinoId: string;
  senhorioId: string;
  valor: number;
  mesReferencia: string;
  dataVencimento: Date | string;
  dataPagamento: Date | string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO" | null;
  descricao: string | null;
  createdAt: Date | null;
  // Campos opcionais que podem existir no schema mas não são essenciais
  contratoId?: string;
  observacoes?: string | null;
}

interface TenantData {
  user: User;
  rents: Rent[];
  summary: {
    totalPending: number;
    pendingCount: number;
    totalRents: number;
  };
}

interface TenantDashboardProps {
  initialData: TenantData;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ initialData }) => {
  const data = initialData;

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bem-vindo, {data.user.fullName}
              </h1>
              <p className="text-gray-600 mt-1">
                Dashboard do Inquilino - RentWise
              </p>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <Badge variant="outline" className="text-sm">
                {data.user.role || "INQUILINO"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <Euro className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(data.summary.totalPending)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {data.summary.pendingCount}{" "}
              {data.summary.pendingCount === 1
                ? "renda pendente"
                : "rendas pendentes"}
            </p>
          </CardContent>
        </Card>

        {/* Rendas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Minhas Rendas
            </CardTitle>
            <CardDescription>Gerir os seus pagamentos de renda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.rents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ainda não tem rendas registadas
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quando o seu senhorio adicionar rendas, elas aparecerão
                    aqui.
                  </p>
                </div>
              ) : (
                data.rents.map((rent) => (
                  <div
                    key={rent.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {rent.descricao || `Renda ${rent.mesReferencia}`}
                        </h4>
                        <Badge className={getStatusColor(rent.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(rent.status)}
                            {rent.status || "INDEFINIDO"}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Vencimento: {formatDate(rent.dataVencimento)}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(rent.valor)}
                        </span>
                      </div>
                      {rent.status === "PAGO" && rent.dataPagamento && (
                        <p className="text-xs text-green-600 mt-1">
                          Pago em: {formatDate(rent.dataPagamento)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantDashboard;
