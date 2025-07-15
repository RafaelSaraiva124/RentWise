"use server";

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTenantRents } from "./tenant";
import { getLandlordDashboardData } from "./landlord";

export async function getDashboardData() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/sign-in");
    }

    // Buscar dados do usuário
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

    if (!user.length) {
      redirect("/unauthorized");
    }

    const currentUser = user[0];

    // Redirecionar baseado no role
    if (currentUser.role === "INQUILINO") {
      const tenantData = await getTenantRents();
      return {
        success: tenantData.success,
        userType: "INQUILINO" as const,
        data: tenantData.data,
        error: tenantData.error,
      };
    } else if (currentUser.role === "SENHORIO") {
      const landlordData = await getLandlordDashboardData();
      return {
        success: landlordData.success,
        userType: "SENHORIO" as const,
        data: landlordData.data,
        error: landlordData.error,
      };
    } else {
      redirect("/unauthorized");
    }
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return {
      success: false,
      error: "Erro ao carregar dados",
    };
  }
}
