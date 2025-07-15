"use server";

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "signin error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existingUser.length > 0) {
    return { success: false, message: "O utilizador já existe" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
    });
    await signInWithCredentials({ email, password });
    return { success: true };
  } catch (error) {
    console.log(error, "signup error");
    return { success: false, error: "Erro ao criar utilizador" };
  }
};

export async function requestLandlordAccess() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Utilizador não autenticado");
    }

    await db
      .update(users)
      .set({
        status: "PENDING",
      })
      .where(eq(users.id, session.user.id));

    return { success: true, message: "Pedido de acesso enviado com sucesso" };
  } catch (error) {
    console.error("Erro ao solicitar acesso de senhorio:", error);
    throw new Error("Erro ao processar pedido de acesso");
  }
}
