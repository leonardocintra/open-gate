"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [message, setMessage] = useState("");
  const openGate = async () => {
    setMessage("Abrindo / fechando o portão...");

    try {
      const res = await fetch(`/api/open-gate`, { method: "POST" });
      if (!res.ok) {
        setMessage(
          `Acesso negado! Erro: ${res.statusText} - ${res.status} - ${await res.text()}`
        );
        return;
      }

      setMessage("Enviado comando para abrir/fechar o portão!");
    } catch (error) {
      console.error("Erro ao enviar comando para o portão:", error);
      setMessage("Erro inesperado ao comunicar com o serviço do portão.");
      return;
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
            <p className="text-center text-gray-700 font-medium">
              Clique para abrir ou fechar o portão
            </p>
            <div className="flex justify-center items-center">
              <button
                onClick={() => openGate()}
                aria-label="Abrir ou fechar o portão"
                className="h-16 w-16 rounded-full flex items-center justify-center transition transform active:scale-95 focus:outline-none shadow-[0_10px_25px_rgba(0,0,0,0.35)] bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
              />
            </div>
            <div className="text-center space-y-2">
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
