"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [message, setMessage] = useState("");

  const openGate = async () => {
    setMessage("Abrindo / fechando o portão...");
    const res = await fetch(`/api/open-gate`, { method: "POST" });
    if (!res.ok) {
      setMessage(
        `Acesso negado! Erro: ${res.statusText} - ${
          res.status
        } - ${await res.text()}`
      );
    } else {
      setMessage("Enviado comando para abrir/fechar o portão!");
    }
  };

  const notLogged = () => (
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
            <Link
              href="https://wa.me/5516999735008"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chame no Whatsapp!
            </Link>
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="">
      {!isSignedIn ? (
        notLogged()
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="space-y-6 w-full max-w-sm">
            <div className="flex justify-center items-center gap-3">
              <p>Olá, {user?.fullName}</p>
              <UserButton afterSignOutUrl="/" />
            </div>
            <div className="flex justify-center items-center">
              <button
                onClick={() => openGate()}
                className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg text-lg font-semibold transition transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:bg-blue-600"
              >
                Abrir / Fechar Portão
              </button>
            </div>
            <div className="text-center">
              {message && (
                <p className="text-red-500 font-semibold">{message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
