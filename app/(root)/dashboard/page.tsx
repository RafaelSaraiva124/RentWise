import React from "react";
import { getDashboardData } from "@/lib/actions/dashboard";
import TenantDashboard from "@/components/TenantDashboard";
import  LandlordDashboard  from "@/components/LandlordDashboard";
import { redirect } from "next/navigation";

const Page = async () => {
  const result = await getDashboardData();

  if (!result.success || !result.data) {
    redirect(
      "/error?message=" +
        encodeURIComponent(result.error || "Erro desconhecido"),
    );
  }

  if (result.userType === "INQUILINO") {
    return <TenantDashboard initialData={result.data} />;
  } else if (result.userType === "SENHORIO") {
    return <LandlordDashboard initialData={result.data} />;
  } else {
    redirect("/unauthorized");
  }
};

export default Page;
