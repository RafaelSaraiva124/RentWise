import React from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

const Page = () => {
  return (
    <div>
      <form
        action={async () => {
          "use server";

          await signOut();
        }}
        className="mb-10"
      >
        <Button className="bg-red-700">Terminar Sessão</Button>
      </form>
    </div>
  );
};
export default Page;
