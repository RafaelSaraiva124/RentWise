"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users, despesas, contratos, propriedades } from "@/database/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Função para calcular valor da água
function calculateWaterCost(
  leituraAnterior: number,
  leituraAtual: number,
  precoM3: number,
  taxaFixa: number = 0,
): number {
  const consumo = leituraAtual - leituraAnterior;
  return consumo * precoM3 + taxaFixa;
}

// Função para calcular valor da eletricidade
function calculateElectricityCost(
  leituraAnterior: number,
  leituraAtual: number,
  precoKwh: number,
  taxaFixa: number = 0,
): number {
  const consumo = leituraAtual - leituraAnterior;
  return consumo * precoKwh + taxaFixa;
}

export async function addWaterExpense(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se é senhorio
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user.length || user[0].role !== "SENHORIO") {
      return {
        success: false,
        error: "Não autorizado - apenas senhorios podem adicionar despesas",
      };
    }

    const contratoId = formData.get("contratoId") as string;
    const leituraAnterior = parseFloat(
      formData.get("leituraAnterior") as string,
    );
    const leituraAtual = parseFloat(formData.get("leituraAtual") as string);
    const precoM3 = parseFloat(formData.get("precoM3") as string);
    const taxaFixa = parseFloat(formData.get("taxaFixa") as string) || 0;
    const mesReferencia = formData.get("mesReferencia") as string;
    const dataVencimento = formData.get("dataVencimento") as string;
    const descricao = formData.get("descricao") as string;

    // Validações
    if (
      !contratoId ||
      isNaN(leituraAnterior) ||
      isNaN(leituraAtual) ||
      isNaN(precoM3) ||
      !mesReferencia ||
      !dataVencimento
    ) {
      return {
        success: false,
        error: "Todos os campos obrigatórios devem ser preenchidos",
      };
    }

    if (leituraAtual < leituraAnterior) {
      return {
        success: false,
        error: "A leitura atual não pode ser menor que a anterior",
      };
    }

    // Verificar se o contrato pertence ao senhorio
    const contract = await db
      .select()
      .from(contratos)
      .where(
        and(
          eq(contratos.id, contratoId),
          eq(contratos.senhorioId, session.user.id),
          eq(contratos.ativo, true),
        ),
      )
      .limit(1);

    if (!contract.length) {
      return { success: false, error: "Contrato não encontrado" };
    }

    const contractData = contract[0];

    // Verificar se já existe despesa de água para este mês/contrato
    const existingExpense = await db
      .select()
      .from(despesas)
      .where(
        and(
          eq(despesas.contratoId, contratoId),
          eq(despesas.tipo, "AGUA"),
          eq(despesas.mesReferencia, mesReferencia),
        ),
      )
      .limit(1);

    if (existingExpense.length) {
      return {
        success: false,
        error: "Já existe uma despesa de água para este mês neste contrato",
      };
    }

    // Calcular valor automaticamente
    const valorCalculado = calculateWaterCost(
      leituraAnterior,
      leituraAtual,
      precoM3,
      taxaFixa,
    );

    await db.insert(despesas).values({
      contratoId,
      propriedadeId: contractData.propriedadeId,
      inquilinoId: contractData.inquilinoId,
      senhorioId: session.user.id,
      tipo: "AGUA",
      leituraAnteriorAgua: leituraAnterior.toString(),
      leituraAtualAgua: leituraAtual.toString(),
      precoM3Agua: precoM3.toString(),
      taxaFixaAgua: taxaFixa.toString(),
      valorCalculado: valorCalculado.toString(),
      valorFinal: valorCalculado.toString(), // Inicialmente igual ao calculado
      mesReferencia,
      dataVencimento,
      status: "PENDENTE",
      descricao:
        descricao ||
        `Água - ${mesReferencia} (${(leituraAtual - leituraAnterior).toFixed(1)}m³)`,
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Despesa de água adicionada com sucesso" };
  } catch (error) {
    console.error("Erro ao adicionar despesa de água:", error);
    return { success: false, error: "Erro interno ao adicionar despesa" };
  }
}

export async function addElectricityExpense(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se é senhorio
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user.length || user[0].role !== "SENHORIO") {
      return {
        success: false,
        error: "Não autorizado - apenas senhorios podem adicionar despesas",
      };
    }

    const contratoId = formData.get("contratoId") as string;
    const leituraAnterior = parseFloat(
      formData.get("leituraAnterior") as string,
    );
    const leituraAtual = parseFloat(formData.get("leituraAtual") as string);
    const precoKwh = parseFloat(formData.get("precoKwh") as string);
    const taxaFixa = parseFloat(formData.get("taxaFixa") as string) || 0;
    const mesReferencia = formData.get("mesReferencia") as string;
    const dataVencimento = formData.get("dataVencimento") as string;
    const descricao = formData.get("descricao") as string;

    // Validações
    if (
      !contratoId ||
      isNaN(leituraAnterior) ||
      isNaN(leituraAtual) ||
      isNaN(precoKwh) ||
      !mesReferencia ||
      !dataVencimento
    ) {
      return {
        success: false,
        error: "Todos os campos obrigatórios devem ser preenchidos",
      };
    }

    if (leituraAtual < leituraAnterior) {
      return {
        success: false,
        error: "A leitura atual não pode ser menor que a anterior",
      };
    }

    // Verificar se o contrato pertence ao senhorio
    const contract = await db
      .select()
      .from(contratos)
      .where(
        and(
          eq(contratos.id, contratoId),
          eq(contratos.senhorioId, session.user.id),
          eq(contratos.ativo, true),
        ),
      )
      .limit(1);

    if (!contract.length) {
      return { success: false, error: "Contrato não encontrado" };
    }

    const contractData = contract[0];

    // Verificar se já existe despesa de eletricidade para este mês/contrato
    const existingExpense = await db
      .select()
      .from(despesas)
      .where(
        and(
          eq(despesas.contratoId, contratoId),
          eq(despesas.tipo, "ELETRICIDADE"),
          eq(despesas.mesReferencia, mesReferencia),
        ),
      )
      .limit(1);

    if (existingExpense.length) {
      return {
        success: false,
        error:
          "Já existe uma despesa de eletricidade para este mês neste contrato",
      };
    }

    // Calcular valor automaticamente
    const valorCalculado = calculateElectricityCost(
      leituraAnterior,
      leituraAtual,
      precoKwh,
      taxaFixa,
    );

    await db.insert(despesas).values({
      contratoId,
      propriedadeId: contractData.propriedadeId,
      inquilinoId: contractData.inquilinoId,
      senhorioId: session.user.id,
      tipo: "ELETRICIDADE",
      leituraAnteriorEletricidade: leituraAnterior.toString(),
      leituraAtualEletricidade: leituraAtual.toString(),
      precoKwhEletricidade: precoKwh.toString(),
      taxaFixaEletricidade: taxaFixa.toString(),
      valorCalculado: valorCalculado.toString(),
      valorFinal: valorCalculado.toString(), // Inicialmente igual ao calculado
      mesReferencia,
      dataVencimento,
      status: "PENDENTE",
      descricao:
        descricao ||
        `Eletricidade - ${mesReferencia} (${(leituraAtual - leituraAnterior).toFixed(1)}kWh)`,
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Despesa de eletricidade adicionada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao adicionar despesa de eletricidade:", error);
    return { success: false, error: "Erro interno ao adicionar despesa" };
  }
}

export async function updateExpenseStatus(
  expenseId: string,
  newStatus: "PAGO" | "PENDENTE" | "VENCIDO",
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se a despesa pertence ao senhorio
    const expense = await db
      .select()
      .from(despesas)
      .where(eq(despesas.id, expenseId))
      .limit(1);

    if (!expense.length) {
      return { success: false, error: "Despesa não encontrada" };
    }

    if (expense[0].senhorioId !== session.user.id) {
      return {
        success: false,
        error: "Não autorizado - esta despesa não lhe pertence",
      };
    }

    // Atualizar status
    const updateData: any = { status: newStatus };
    if (newStatus === "PAGO") {
      updateData.dataPagamento = new Date().toISOString().split("T")[0];
    } else {
      updateData.dataPagamento = null;
    }

    await db.update(despesas).set(updateData).where(eq(despesas.id, expenseId));

    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Status da despesa atualizado para ${newStatus}`,
    };
  } catch (error) {
    console.error("Erro ao atualizar status da despesa:", error);
    return {
      success: false,
      error: "Erro ao atualizar status da despesa",
    };
  }
}

export async function adjustExpenseValue(
  expenseId: string,
  newValue: number,
  observacoes?: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se a despesa pertence ao senhorio
    const expense = await db
      .select()
      .from(despesas)
      .where(eq(despesas.id, expenseId))
      .limit(1);

    if (!expense.length) {
      return { success: false, error: "Despesa não encontrada" };
    }

    if (expense[0].senhorioId !== session.user.id) {
      return {
        success: false,
        error: "Não autorizado - esta despesa não lhe pertence",
      };
    }

    if (newValue <= 0) {
      return { success: false, error: "O valor deve ser positivo" };
    }

    await db
      .update(despesas)
      .set({
        valorFinal: newValue.toString(),
        observacoes:
          observacoes ||
          `Valor ajustado manualmente de €${expense[0].valorCalculado} para €${newValue.toFixed(2)}`,
      })
      .where(eq(despesas.id, expenseId));

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Valor da despesa ajustado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao ajustar valor da despesa:", error);
    return {
      success: false,
      error: "Erro ao ajustar valor da despesa",
    };
  }
}
