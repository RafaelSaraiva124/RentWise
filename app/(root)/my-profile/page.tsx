import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/auth";
import { User, LogOut, Home, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import {
  getProfileData,
  requestLandlordAccessAction,
  type ProfileUser,
} from "@/lib/actions/profile";

const ProfilePage = async () => {
  // Buscar dados do perfil de forma segura
  const profileResult = await getProfileData();

  // Se há erro, mostrar mensagem de erro
  if (!profileResult.success || !profileResult.user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-4">
                  {profileResult.error || "Erro ao carregar dados do perfil"}
                </p>
                <form
                  action={async () => {
                    "use server";
                    redirect("/sign-in");
                  }}
                >
                  <Button variant="outline">Ir para Login</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const user = profileResult.user;

  const getStatusBadge = (status: ProfileUser["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendente
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Aprovado
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">{user.role || "INDEFINIDO"}</Badge>;
    }
  };

  const canRequestLandlordAccess = user.role === "INQUILINO";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Perfil do Utilizador
          </h1>
          <p className="text-gray-600">Gerir a sua conta</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xl">{user.fullName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {getStatusBadge(user.status)}
              {user.status === "PENDING" && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  🕐 Aguardando aprovação
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Landlord Access Card - Only for INQUILINO */}
        {canRequestLandlordAccess && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Tornar-se Senhorio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Solicite acesso para gerir propriedades, criar contratos e
                cobrar rendas.
              </p>

              {/* Show different content based on status */}
              {user.status === "PENDING" ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Pedido Já Enviado</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    O seu pedido está a ser analisado. Aguarde pela resposta.
                  </p>
                </div>
              ) : user.status === "REJECTED" ? (
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">
                        Pedido Anterior Rejeitado
                      </span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      Pode tentar solicitar novamente.
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      const result = await requestLandlordAccessAction();

                      if (!result.success) {
                        console.error("Erro:", result.error);
                      }
                    }}
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Home className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  </form>
                </div>
              ) : (
                <form
                  action={async () => {
                    "use server";
                    const result = await requestLandlordAccessAction();

                    if (!result.success) {
                      console.error("Erro:", result.error);
                    }
                  }}
                >
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Home className="h-4 w-4 mr-2" />
                    Solicitar Acesso de Senhorio
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Messages - Only show if NOT INQUILINO */}
        {user.role !== "INQUILINO" && user.status === "PENDING" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Pedido em Análise</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                O seu pedido para se tornar senhorio está a ser analisado. Será
                notificado quando houver uma resposta.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Message for Rejected - Only show if NOT INQUILINO */}
        {user.role !== "INQUILINO" && user.status === "REJECTED" && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">Pedido Rejeitado</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                O seu pedido para se tornar senhorio foi rejeitado. Pode tentar
                novamente mais tarde ou contactar o suporte.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success Message for Approved */}
        {user.status === "APPROVED" && user.role === "SENHORIO" && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Acesso de Senhorio Ativo</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Parabéns! Tem acesso completo às funcionalidades de senhorio.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Logout Card */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Terminar Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Sair da sua conta neste dispositivo.
            </p>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Terminar Sessão
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
