"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [message, setMessage] = useState("");

  const openGate = async () => {
    setMessage("Abrindo portão...");
    const res = await fetch(`/api/open-gate`, { method: "POST" });
    if (!res.ok) {
      setMessage("Acesso negado");
    } else {
      setMessage("Enviado comando para abrir o portão!");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6 border-2 p-3 rounded-2xl shadow-2xl">
      {!isSignedIn ? (
        <div>
          <div className="flex flex-col items-center justify-center h-screen">
            <p className="mb-6 text-lg text-gray-700">
              Você precisa fazer login para acessar o sistema.
            </p>
            <SignInButton>
              <button className="px-8 py-3 rounded-lg border-2 border-blue-500 bg-white text-blue-500 font-bold text-lg shadow-md hover:bg-blue-500 hover:text-white transition">
                Login com Google
              </button>
            </SignInButton>
            <p className="mt-4 text-sm text-gray-500">
              Não tem uma conta?{" "}
              <span className="font-semibold text-blue-500">
                Faça seu cadastro!
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <div className="space-y-3">
            <div className="flex justify-center items-center gap-3">
              <p>Olá, {user?.fullName}</p>
              <UserButton afterSignOutUrl="/" />
            </div>
            <div className="flex justify-center items-center">
              <button
                onClick={() => openGate()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Abrir Portão
              </button>
            </div>
            <div className="text-center my-3">
              {message && <p className="text-red-500 font-semibold">{message}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
