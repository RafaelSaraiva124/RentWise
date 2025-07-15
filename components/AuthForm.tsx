"use client";
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormReturn,
  Path,
} from "react-hook-form";
import React from "react";
import { ZodType } from "zod";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const isSignIn = type === "SIGN_IN";
  const FIELD_NAMES: Record<string, string> = {
    fullName: "Nome completo",
    email: "Email",
    password: "Palavra-passe",
  };
  const FIELD_TYPES: Record<string, string> = {
    fullName: "text",
    email: "email",
    password: "password",
  };

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: isSignIn
          ? "Login realizado com sucesso!"
          : "Conta criada com sucesso!",
      });
      router.push("/");
    } else {
      toast({
        title: `Erro ao ${isSignIn ? "iniciar sessão" : "criar conta"}`,
        description: result.error ?? "An Error ocurred",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn
          ? "Bem vindo de volta á RentWise!"
          : "Crie a sua conta agora na RentWise!"}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? "Aceda à sua conta para gerir as suas rendas de forma simples, segura e organizada."
          : "Registe-se para começar a acompanhar todos os pagamentos."}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 w-full"
        >
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]}
                      {...field}
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="form-btn text-gray-800">
            {isSignIn ? "Entrar" : "Criar Conta"}
          </Button>
        </form>
      </Form>
      <p className="text-center text-base font-medium">
        {isSignIn ? "Novo na RentWise?" : "Já tenho uma conta!"}
        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary"
        >
          {isSignIn ? " Criar Conta" : " Iniciar Sessão"}
        </Link>
      </p>
    </div>
  );
};
export default AuthForm;
