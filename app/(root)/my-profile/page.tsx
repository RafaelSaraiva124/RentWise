import React from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";
import { requestLandlordAccess } from "@/lib/actions/auth";

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
      <form
        action={async () => {
          "use server";

          await requestLandlordAccess();
        }}
        className="mb-10"
      >
        <Button className="bg-blue-600 text-white">Quero ser senhorio</Button>
      </form>
    </div>
  );
};
export default Page;
