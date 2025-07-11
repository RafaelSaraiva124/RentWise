import React from "react";

const Page = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-10 md:px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold uppercase">
        🏁 Cuidado, ultrapassaste a meta!
      </h1>
      <p className="mt-3 max-w-xl text-center">
        Estás a fazer pedidos à velocidade de um atleta olímpico... Mas os
        nossos servidores ainda estão a fazer o aquecimento 😅 <br /> Dá-lhes um
        tempo. Já voltamos ao ritmo certo!
      </p>
    </main>
  );
};
export default Page;
