import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Euro,
  Receipt,
  Calendar,
  Search,
  Filter,
  Eye,
  Building,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Building2,
  Wrench,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

// Interfaces correspondentes ao seu schema
interface Property {
  id: string;
  nome: string;
  endereco: string;
  descricao: string | null;
  valorRenda: number;
  ativa: boolean | null;
  createdAt: Date | null;
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

interface Expense {
  id: string;
  contratoId: string;
  propriedadeId: string;
  inquilinoId: string;
  senhorioId: string;
  tipo:
    | "AGUA"
    | "ELETRICIDADE"
    | "GAS"
    | "INTERNET"
    | "CONDOMINIO"
    | "LIMPEZA"
    | "MANUTENCAO"
    | "OUTROS";
  valorFinal: number;
  mesReferencia: string;
  dataVencimento: string;
  dataPagamento: string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO";
  descricao: string | null;
  observacoes: string | null;
  createdAt: Date | null;
  propriedadeNome: string;
  propriedadeEndereco: string;
  inquilinoNome: string;
  inquilinoEmail: string;
  leituraAnteriorAgua?: number;
  leituraAtualAgua?: number;
  precoM3Agua?: number;
  taxaFixaAgua?: number;
  leituraAnteriorEletricidade?: number;
  leituraAtualEletricidade?: number;
  precoKwhEletricidade?: number;
  taxaFixaEletricidade?: number;
  valorCalculado?: number;
}

interface PaymentsPanelProps {
  properties: Property[];
  rents: Rent[];
  expenses: Expense[];
}

interface PaymentItem {
  id: string;
  type: "rent" | "expense";
  propriedadeNome: string;
  inquilinoNome: string;
  descricao: string;
  valor: number;
  mesReferencia: string;
  dataVencimento: string;
  dataPagamento: string | null;
  status: "PAGO" | "PENDENTE" | "VENCIDO";
  categoria?: string; // Para despesas
  observacoes?: string | null;
}

const PaymentsPanelView: React.FC<PaymentsPanelProps> = ({
  properties,
  rents,
  expenses,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PAGO" | "PENDENTE" | "VENCIDO"
  >("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "rent" | "expense">(
    "ALL",
  );
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "value" | "property">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const getExpenseIcon = (tipo: string) => {
    switch (tipo) {
      case "AGUA":
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case "ELETRICIDADE":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "GAS":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "INTERNET":
        return <Wifi className="h-4 w-4 text-purple-500" />;
      case "CONDOMINIO":
        return <Building2 className="h-4 w-4 text-gray-500" />;
      case "LIMPEZA":
        return <Sparkles className="h-4 w-4 text-pink-500" />;
      case "MANUTENCAO":
        return <Wrench className="h-4 w-4 text-red-500" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-500" />;
    }
  };

  const isOverdue = (payment: PaymentItem) => {
    if (payment.status === "PAGO") return false;
    const today = new Date();
    const dueDate = new Date(payment.dataVencimento);
    return dueDate < today;
  };

  // Combinar rendas e despesas numa lista unificada
  const allPayments: PaymentItem[] = useMemo(() => {
    const rentPayments: PaymentItem[] = rents.map((rent) => ({
      id: rent.id,
      type: "rent" as const,
      propriedadeNome: rent.propriedadeNome,
      inquilinoNome: rent.inquilinoNome,
      descricao: rent.descricao || `Renda ${rent.mesReferencia}`,
      valor: rent.valor,
      mesReferencia: rent.mesReferencia,
      dataVencimento:
        typeof rent.dataVencimento === "string"
          ? rent.dataVencimento
          : rent.dataVencimento.toISOString(),
      dataPagamento: rent.dataPagamento
        ? typeof rent.dataPagamento === "string"
          ? rent.dataPagamento
          : rent.dataPagamento.toISOString()
        : null,
      status: rent.status || "PENDENTE",
    }));

    const expensePayments: PaymentItem[] = expenses.map((expense) => ({
      id: expense.id,
      type: "expense" as const,
      propriedadeNome: expense.propriedadeNome,
      inquilinoNome: expense.inquilinoNome,
      descricao:
        expense.descricao || `${expense.tipo} ${expense.mesReferencia}`,
      valor: expense.valorFinal,
      mesReferencia: expense.mesReferencia,
      dataVencimento: expense.dataVencimento,
      dataPagamento: expense.dataPagamento,
      status: expense.status,
      categoria: expense.tipo,
      observacoes: expense.observacoes,
    }));

    return [...rentPayments, ...expensePayments];
  }, [rents, expenses]);

  // Filtrar e ordenar pagamentos
  const filteredPayments = useMemo(() => {
    let filtered = allPayments.filter((payment) => {
      const matchesSearch =
        payment.propriedadeNome
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        payment.inquilinoNome
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        payment.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;
      const matchesType = typeFilter === "ALL" || payment.type === typeFilter;
      const matchesMonth =
        !selectedMonth || payment.mesReferencia === selectedMonth;
      const matchesProperty =
        !selectedProperty || payment.propriedadeNome === selectedProperty;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesMonth &&
        matchesProperty
      );
    });

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.dataVencimento).getTime() -
            new Date(b.dataVencimento).getTime();
          break;
        case "value":
          comparison = a.valor - b.valor;
          break;
        case "property":
          comparison = a.propriedadeNome.localeCompare(b.propriedadeNome);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    allPayments,
    searchTerm,
    statusFilter,
    typeFilter,
    selectedMonth,
    selectedProperty,
    sortBy,
    sortOrder,
  ]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const pendingPayments = filteredPayments.filter(
      (p) => p.status === "PENDENTE",
    );
    const paidPayments = filteredPayments.filter((p) => p.status === "PAGO");
    const overduePayments = filteredPayments.filter(
      (p) =>
        p.status === "VENCIDO" || (p.status === "PENDENTE" && isOverdue(p)),
    );

    const pendingRents = pendingPayments.filter((p) => p.type === "rent");
    const pendingExpenses = pendingPayments.filter((p) => p.type === "expense");

    return {
      totalPending: pendingPayments.reduce((sum, p) => sum + p.valor, 0),
      totalPaid: paidPayments.reduce((sum, p) => sum + p.valor, 0),
      totalOverdue: overduePayments.reduce((sum, p) => sum + p.valor, 0),
      pendingCount: pendingPayments.length,
      paidCount: paidPayments.length,
      overdueCount: overduePayments.length,
      pendingRentsValue: pendingRents.reduce((sum, p) => sum + p.valor, 0),
      pendingExpensesValue: pendingExpenses.reduce(
        (sum, p) => sum + p.valor,
        0,
      ),
      pendingRentsCount: pendingRents.length,
      pendingExpensesCount: pendingExpenses.length,
    };
  }, [filteredPayments]);

  // Obter meses únicos para filtro
  const availableMonths = useMemo(() => {
    const months = [...new Set(allPayments.map((p) => p.mesReferencia))];
    return months.sort().reverse();
  }, [allPayments]);

  // Obter propriedades únicas para filtro
  const availableProperties = useMemo(() => {
    const propertyNames = [
      ...new Set(allPayments.map((p) => p.propriedadeNome)),
    ];
    return propertyNames.sort();
  }, [allPayments]);

  // Calcular estatísticas por categoria de despesas
  const expensesByCategory = useMemo(() => {
    const categories = expenses.reduce(
      (acc, expense) => {
        if (!acc[expense.tipo]) {
          acc[expense.tipo] = { total: 0, count: 0, pending: 0 };
        }
        acc[expense.tipo].total += expense.valorFinal;
        acc[expense.tipo].count += 1;
        if (expense.status === "PENDENTE") {
          acc[expense.tipo].pending += expense.valorFinal;
        }
        return acc;
      },
      {} as Record<string, { total: number; count: number; pending: number }>,
    );

    return Object.entries(categories)
      .map(([type, data]) => ({
        type,
        ...data,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSelectedMonth("");
    setSelectedProperty("");
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pendente
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.totalPending)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingCount} items
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid)}
                </p>
                <p className="text-xs text-gray-500">{stats.paidCount} items</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalOverdue)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.overdueCount} items
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rendas:</span>
                <span className="font-medium text-yellow-600">
                  {formatCurrency(stats.pendingRentsValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Despesas:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(stats.pendingExpensesValue)}
                </span>
              </div>
              <div className="text-xs text-gray-500 pt-1">
                {stats.pendingRentsCount} rendas, {stats.pendingExpensesCount}{" "}
                despesas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por categoria de despesas */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {expensesByCategory.map((category) => (
                <div
                  key={category.type}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getExpenseIcon(category.type)}
                    <div>
                      <p className="text-sm font-medium">{category.type}</p>
                      <p className="text-xs text-gray-500">
                        {category.count} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(category.total)}
                    </p>
                    {category.pending > 0 && (
                      <p className="text-xs text-yellow-600">
                        {formatCurrency(category.pending)} pendente
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {/* Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="VENCIDO">Vencido</option>
            </select>

            {/* Filtro por Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Rendas e Despesas</option>
              <option value="rent">Apenas Rendas</option>
              <option value="expense">Apenas Despesas</option>
            </select>

            {/* Filtro por Mês */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os meses</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            {/* Filtro por Propriedade */}
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as propriedades</option>
              {availableProperties.map((property) => (
                <option key={property} value={property}>
                  {property}
                </option>
              ))}
            </select>
          </div>

          {/* Controles de ordenação */}
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Data de Vencimento</option>
              <option value="value">Valor</option>
              <option value="property">Propriedade</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1"
            >
              {sortOrder === "asc" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {sortOrder === "asc" ? "Crescente" : "Decrescente"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">
                Nenhum pagamento encontrado com os filtros aplicados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => {
                const isPaymentOverdue = isOverdue(payment);

                return (
                  <Card
                    key={`${payment.type}-${payment.id}`}
                    className={`hover:shadow-md transition-shadow ${
                      isPaymentOverdue ? "border-l-4 border-l-red-500" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {payment.type === "rent" ? (
                              <Euro className="h-4 w-4 text-blue-500" />
                            ) : (
                              getExpenseIcon(payment.categoria || "OUTROS")
                            )}
                            <h4 className="font-semibold">
                              {payment.descricao}
                            </h4>
                            <Badge className={getStatusColor(payment.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(payment.status)}
                                {payment.status}
                              </span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {payment.type === "rent" ? "Renda" : "Despesa"}
                            </Badge>
                            {isPaymentOverdue && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                Atrasado
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {payment.propriedadeNome}
                            </div>
                            <div>
                              <strong>Inquilino:</strong>{" "}
                              {payment.inquilinoNome}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Venc: {formatDate(payment.dataVencimento)}
                            </div>
                          </div>

                          {payment.dataPagamento && (
                            <div className="text-sm text-green-600 mt-1">
                              <strong>Pago em:</strong>{" "}
                              {formatDate(payment.dataPagamento)}
                            </div>
                          )}

                          {payment.observacoes && (
                            <div className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                              <strong>Observações:</strong>{" "}
                              {payment.observacoes}
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-xl font-bold">
                            {formatCurrency(payment.valor)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.mesReferencia}
                          </div>

                          {payment.status === "PENDENTE" && (
                            <Button
                              size="sm"
                              className="mt-2 bg-green-600 hover:bg-green-700"
                            >
                              Marcar Pago
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPanelView;
