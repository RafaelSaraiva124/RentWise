"use server";

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users, rendas } from "@/database/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getTenantRents() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/sign-in");
    }

    // Verificar se o usuário é inquilino
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

    if (!user.length || user[0].role !== "INQUILINO") {
      redirect("/unauthorized");
    }

    // Buscar rendas do inquilino
    const userRents = await db
      .select({
        id: rendas.id,
        inquilinoId: rendas.inquilinoId,
        senhorioId: rendas.senhorioId,
        valor: rendas.valor,
        mesReferencia: rendas.mesReferencia,
        dataVencimento: rendas.dataVencimento,
        dataPagamento: rendas.dataPagamento,
        status: rendas.status,
        descricao: rendas.descricao,
        createdAt: rendas.createdAt,
      })
      .from(rendas)
      .where(eq(rendas.inquilinoId, session.user.id));

    // Calcular estatísticas (mesmo se não houver rendas)
    const pendingRents = userRents.filter((rent) => rent.status === "PENDENTE");
    const totalPending = pendingRents.reduce(
      (sum, rent) => sum + parseFloat(rent.valor.toString()),
      0,
    );

    // Sempre retorna sucesso, mesmo sem dados
    return {
      success: true,
      data: {
        user: user[0],
        rents: userRents.map((rent) => ({
          ...rent,
          valor: parseFloat(rent.valor.toString()),
        })),
        summary: {
          totalPending,
          pendingCount: pendingRents.length,
          totalRents: userRents.length,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar rendas do inquilino:", error);

    // Em caso de erro, tenta buscar pelo menos os dados do usuário
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

        if (user.length && user[0].role === "INQUILINO") {
          return {
            success: true,
            data: {
              user: user[0],
              rents: [],
              summary: {
                totalPending: 0,
                pendingCount: 0,
                totalRents: 0,
              },
            },
          };
        }
      }
    } catch (fallbackError) {
      console.error("Erro no fallback:", fallbackError);
    }

    return {
      success: false,
      error: "Erro ao carregar dados",
    };
  }
}
