"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const DEFAULT_MESSAGE = "Clique para abrir ou fechar o portão";
  const FEEDBACK_RESET_DELAY = 20_000;
  const { isSignedIn, user } = useUser();
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [buttonState, setButtonState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = () => {
    if (!resetTimerRef.current) return;
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
  };

  const scheduleResetFeedback = () => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setMessage(DEFAULT_MESSAGE);
      setButtonState("idle");
      resetTimerRef.current = null;
    }, FEEDBACK_RESET_DELAY);
  };

  useEffect(() => {
    return () => {
      clearResetTimer();
    };
  }, []);

  const openGate = async () => {
    clearResetTimer();
    setButtonState("idle");
    setMessage("Abrindo / fechando o portão...");

    try {
      const res = await fetch(`/api/open-gate`, { method: "POST" });
      if (!res.ok) {
        setMessage(
          `Acesso negado! Erro: ${res.statusText} - ${res.status} - ${await res.text()}`,
        );
        setButtonState("error");
        scheduleResetFeedback();
        return;
      }

      setMessage("Enviado comando para abrir/fechar o portão!");
      setButtonState("success");
      scheduleResetFeedback();
    } catch (error) {
      console.error("Erro ao enviar comando para o portão:", error);
      setMessage("Erro inesperado ao comunicar com o serviço do portão.");
      setButtonState("error");
      scheduleResetFeedback();
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
            <div className="text-center">
              <p
                className={`font-medium transition-colors duration-200 ${
                  buttonState === "success"
                    ? "text-green-600"
                    : buttonState === "error"
                      ? "text-red-500"
                      : "text-gray-700"
                }`}
                aria-live="polite"
              >
                {message}
              </p>
            </div>
            <div className="flex justify-center items-center">
              <button
                onClick={() => openGate()}
                aria-label="Abrir ou fechar o portão"
                className={`h-16 w-16 rounded-full flex items-center justify-center transition transform active:scale-95 focus:outline-none shadow-[0_10px_25px_rgba(0,0,0,0.35)] bg-linear-to-b ${
                  buttonState === "success"
                    ? "from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
                    : buttonState === "error"
                      ? "from-red-400 to-red-600 hover:from-red-500 hover:to-red-700"
                      : "from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
