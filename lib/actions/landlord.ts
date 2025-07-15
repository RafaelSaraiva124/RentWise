"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users, rendas, propriedades, contratos } from "@/database/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getLandlordDashboardData() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/sign-in");
    }

    // Verificar se o usuário é senhorio
    const user = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user.length || user[0].role !== "SENHORIO") {
      redirect("/unauthorized");
    }

    const currentUser = user[0];

    // Buscar propriedades do senhorio
    const userProperties = await db
      .select()
      .from(propriedades)
      .where(eq(propriedades.senhorioId, session.user.id));

    // Buscar contratos ativos
    const activeContracts = await db
      .select({
        id: contratos.id,
        propriedadeId: contratos.propriedadeId,
        inquilinoId: contratos.inquilinoId,
        valorRenda: contratos.valorRenda,
        dataInicio: contratos.dataInicio,
        dataFim: contratos.dataFim,
        diaVencimento: contratos.diaVencimento,
        // Dados da propriedade
        propriedadeNome: propriedades.nome,
        propriedadeEndereco: propriedades.endereco,
        // Dados do inquilino
        inquilinoNome: users.fullName,
        inquilinoEmail: users.email,
      })
      .from(contratos)
      .innerJoin(propriedades, eq(contratos.propriedadeId, propriedades.id))
      .innerJoin(users, eq(contratos.inquilinoId, users.id))
      .where(
        and(
          eq(contratos.senhorioId, session.user.id),
          eq(contratos.ativo, true),
        ),
      );

    // Buscar rendas
    const managedRents = await db
      .select({
        id: rendas.id,
        contratoId: rendas.contratoId,
        propriedadeId: rendas.propriedadeId,
        inquilinoId: rendas.inquilinoId,
        senhorioId: rendas.senhorioId,
        valor: rendas.valor,
        mesReferencia: rendas.mesReferencia,
        dataVencimento: rendas.dataVencimento,
        dataPagamento: rendas.dataPagamento,
        status: rendas.status,
        descricao: rendas.descricao,
        createdAt: rendas.createdAt,
        // Dados da propriedade
        propriedadeNome: propriedades.nome,
        propriedadeEndereco: propriedades.endereco,
        // Dados do inquilino
        inquilinoNome: users.fullName,
        inquilinoEmail: users.email,
      })
      .from(rendas)
      .innerJoin(propriedades, eq(rendas.propriedadeId, propriedades.id))
      .innerJoin(users, eq(rendas.inquilinoId, users.id))
      .where(eq(rendas.senhorioId, session.user.id));

    // Calcular estatísticas
    const pendingRents = managedRents.filter(
      (rent) => rent.status === "PENDENTE",
    );
    const paidRents = managedRents.filter((rent) => rent.status === "PAGO");
    const totalPending = pendingRents.reduce(
      (sum, rent) => sum + parseFloat(rent.valor.toString()),
      0,
    );
    const totalReceived = paidRents.reduce(
      (sum, rent) => sum + parseFloat(rent.valor.toString()),
      0,
    );

    return {
      success: true,
      data: {
        user: currentUser,
        properties: userProperties.map((prop) => ({
          ...prop,
          valorRenda: parseFloat(prop.valorRenda.toString()),
        })),
        contracts: activeContracts.map((contract) => ({
          ...contract,
          valorRenda: parseFloat(contract.valorRenda.toString()),
        })),
        rents: managedRents.map((rent) => ({
          ...rent,
          valor: parseFloat(rent.valor.toString()),
        })),
        expenses: [], // Adicionado para satisfazer o tipo LandlordData
        summary: {
          totalPending,
          totalReceived,
          pendingCount: pendingRents.length,
          totalRents: managedRents.length,
          totalProperties: userProperties.length,
          totalContracts: activeContracts.length,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar dados do senhorio:", error);

    // Fallback: retorna dados básicos do usuário
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
            status: users.status,
          })
          .from(users)
          .where(eq(users.id, session.user.id))
          .limit(1);

        if (user.length && user[0].role === "SENHORIO") {
          return {
            success: true,
            data: {
              user: user[0],
              properties: [],
              contracts: [],
              rents: [],
              expenses: [], // Adicionado também no fallback
              summary: {
                totalPending: 0,
                totalReceived: 0,
                pendingCount: 0,
                totalRents: 0,
                totalProperties: 0,
                totalContracts: 0,
              },
            },
          };
        }
      }
    } catch (fallbackError) {
      console.error("Erro no fallback do senhorio:", fallbackError);
    }

    return {
      success: false,
      error: "Erro ao carregar dados do senhorio",
    };
  }
}

// Adicionar nova propriedade
export async function addProperty(formData: FormData) {
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
        error: "Não autorizado - apenas senhorios podem adicionar propriedades",
      };
    }

    const nome = formData.get("nome") as string;
    const endereco = formData.get("endereco") as string;
    const descricao = formData.get("descricao") as string;
    const valorRenda = formData.get("valorRenda") as string;

    if (!nome || !endereco || !valorRenda) {
      return {
        success: false,
        error: "Nome, endereço e valor da renda são obrigatórios",
      };
    }

    if (isNaN(parseFloat(valorRenda)) || parseFloat(valorRenda) <= 0) {
      return {
        success: false,
        error: "Valor da renda deve ser um número positivo",
      };
    }

    await db.insert(propriedades).values({
      senhorioId: session.user.id,
      nome,
      endereco,
      descricao: descricao || null,
      valorRenda,
      ativa: true,
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Propriedade adicionada com sucesso" };
  } catch (error) {
    console.error("Erro ao adicionar propriedade:", error);
    return { success: false, error: "Erro interno ao adicionar propriedade" };
  }
}

// Adicionar contrato (inquilino a uma propriedade)
export async function addContract(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    const propriedadeId = formData.get("propriedadeId") as string;
    const inquilinoEmail = formData.get("inquilinoEmail") as string;
    const dataInicio = formData.get("dataInicio") as string;
    const dataFim = formData.get("dataFim") as string;
    const valorRenda = formData.get("valorRenda") as string;
    const diaVencimento = formData.get("diaVencimento") as string;

    if (
      !propriedadeId ||
      !inquilinoEmail ||
      !dataInicio ||
      !valorRenda ||
      !diaVencimento
    ) {
      return { success: false, error: "Todos os campos são obrigatórios" };
    }

    // Verificar se a propriedade pertence ao senhorio
    const property = await db
      .select()
      .from(propriedades)
      .where(
        and(
          eq(propriedades.id, propriedadeId),
          eq(propriedades.senhorioId, session.user.id),
        ),
      )
      .limit(1);

    if (!property.length) {
      return { success: false, error: "Propriedade não encontrada" };
    }

    // Verificar se o inquilino existe
    const tenant = await db
      .select()
      .from(users)
      .where(and(eq(users.email, inquilinoEmail), eq(users.role, "INQUILINO")))
      .limit(1);

    if (!tenant.length) {
      return {
        success: false,
        error: "Inquilino não encontrado com este email",
      };
    }

    // Verificar se já existe contrato ativo para esta propriedade
    const existingContract = await db
      .select()
      .from(contratos)
      .where(
        and(
          eq(contratos.propriedadeId, propriedadeId),
          eq(contratos.ativo, true),
        ),
      )
      .limit(1);

    if (existingContract.length) {
      return {
        success: false,
        error: "Esta propriedade já tem um contrato ativo",
      };
    }

    await db.insert(contratos).values({
      propriedadeId,
      inquilinoId: tenant[0].id,
      senhorioId: session.user.id,
      dataInicio,
      dataFim: dataFim || null,
      valorRenda,
      diaVencimento: parseInt(diaVencimento),
      ativo: true,
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Contrato criado com sucesso" };
  } catch (error) {
    console.error("Erro ao criar contrato:", error);
    return { success: false, error: "Erro interno ao criar contrato" };
  }
}

// Adicionar renda baseada em contrato
export async function addRent(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    const contratoId = formData.get("contratoId") as string;
    const mesReferencia = formData.get("mesReferencia") as string;
    const dataVencimento = formData.get("dataVencimento") as string;
    const descricao = formData.get("descricao") as string;

    if (!contratoId || !mesReferencia || !dataVencimento) {
      return {
        success: false,
        error:
          "Contrato, mês de referência e data de vencimento são obrigatórios",
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

    // Verificar se já existe renda para este mês/contrato
    const existingRent = await db
      .select()
      .from(rendas)
      .where(
        and(
          eq(rendas.contratoId, contratoId),
          eq(rendas.mesReferencia, mesReferencia),
        ),
      )
      .limit(1);

    if (existingRent.length) {
      return {
        success: false,
        error: "Já existe uma renda para este mês neste contrato",
      };
    }

    await db.insert(rendas).values({
      contratoId,
      propriedadeId: contractData.propriedadeId,
      inquilinoId: contractData.inquilinoId,
      senhorioId: session.user.id,
      valor: contractData.valorRenda,
      mesReferencia,
      dataVencimento,
      status: "PENDENTE",
      descricao: descricao || null,
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Renda adicionada com sucesso" };
  } catch (error) {
    console.error("Erro ao adicionar renda:", error);
    return { success: false, error: "Erro interno ao adicionar renda" };
  }
}

export async function updateRentStatus(
  rentId: string,
  newStatus: "PAGO" | "PENDENTE" | "VENCIDO",
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Não autenticado" };
    }

    // Verificar se é senhorio e se a renda lhe pertence
    const rent = await db
      .select()
      .from(rendas)
      .where(eq(rendas.id, rentId))
      .limit(1);

    if (!rent.length) {
      return { success: false, error: "Renda não encontrada" };
    }

    if (rent[0].senhorioId !== session.user.id) {
      return {
        success: false,
        error: "Não autorizado - esta renda não lhe pertence",
      };
    }

    const updateData: any = { status: newStatus };
    if (newStatus === "PAGO") {
      updateData.dataPagamento = new Date().toISOString().split("T")[0]; // formato YYYY-MM-DD
    } else {
      updateData.dataPagamento = null;
    }

    await db.update(rendas).set(updateData).where(eq(rendas.id, rentId));

    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Status da renda atualizado para ${newStatus}`,
    };
  } catch (error) {
    console.error("Erro ao atualizar status da renda:", error);
    return {
      success: false,
      error: "Erro ao atualizar status da renda",
    };
  }
}
