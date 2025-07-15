"use server";

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface ProfileUser {
  fullName: string;
  email: string;
  role: "INQUILINO" | "SENHORIO" | null;
  status: "INDEFINIDO" | "PENDING" | "APPROVED" | "REJECTED" | null;
}

export interface ProfileResponse {
  success: boolean;
  user?: ProfileUser;
  error?: string;
}

/**
 * Busca os dados do perfil do utilizador autenticado
 */
export async function getProfileData(): Promise<ProfileResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sessão não encontrada",
      };
    }

    // Buscar apenas os dados necessários para o perfil
    const userData = await db
      .select({
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userData.length) {
      return {
        success: false,
        error: "Utilizador não encontrado",
      };
    }

    return {
      success: true,
      user: userData[0],
    };
  } catch (error) {
    console.error("Erro ao buscar dados do perfil:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

/**
 * Solicita acesso de senhorio para o utilizador atual
 */
export async function requestLandlordAccessAction(): Promise<ProfileResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Não autenticado",
      };
    }

    // Verificar se o utilizador existe e é inquilino
    const currentUser = await db
      .select({
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser.length) {
      return {
        success: false,
        error: "Utilizador não encontrado",
      };
    }

    if (currentUser[0].role !== "INQUILINO") {
      return {
        success: false,
        error: "Apenas inquilinos podem solicitar acesso de senhorio",
      };
    }

    if (currentUser[0].status === "PENDING") {
      return {
        success: false,
        error: "Já tem um pedido pendente",
      };
    }

    // Atualizar o status para PENDING
    await db
      .update(users)
      .set({
        status: "PENDING",
      })
      .where(eq(users.id, session.user.id));

    // Revalidar a página do perfil
    revalidatePath("/profile");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao solicitar acesso de senhorio:", error);
    return {
      success: false,
      error: "Erro ao processar pedido",
    };
  }
}
