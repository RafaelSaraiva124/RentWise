import React, { ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (session) redirect("/");
  return (
    <main className="auth-container">
      <section className="auth-content">
        <div className="auth-box">
          <Image src="/logo.svg" alt="logo" width={100} height={100} />
          <div>{children}</div>
        </div>
      </section>
      <section className="auth-illustration">
        <Image
          src="/images/loginimg.svg"
          alt="logo"
          width={1000}
          height={1000}
          className="size-full  object-cover"
        />
      </section>
    </main>
  );
};
export default Layout;
