"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const COOLDOWN_SECONDS = 5;
const EMERGENCY_WINDOW_MS = 2000;

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [message, setMessage] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isEmergencyWindow, setIsEmergencyWindow] = useState(false);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const emergencyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
      }
    };
  }, []);

  const startCooldown = () => {
    setCooldownRemaining(COOLDOWN_SECONDS);
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startEmergencyWindow = () => {
    setIsEmergencyWindow(true);
    if (emergencyTimeoutRef.current) {
      clearTimeout(emergencyTimeoutRef.current);
    }
    emergencyTimeoutRef.current = setTimeout(() => {
      setIsEmergencyWindow(false);
    }, EMERGENCY_WINDOW_MS);
  };

  const clearEmergencyWindow = () => {
    setIsEmergencyWindow(false);
    if (emergencyTimeoutRef.current) {
      clearTimeout(emergencyTimeoutRef.current);
      emergencyTimeoutRef.current = null;
    }
  };

  const openGate = async () => {
    const isEmergencyAttempt = cooldownRemaining > 0 && isEmergencyWindow;

    if (cooldownRemaining > 0 && !isEmergencyAttempt) {
      setMessage(`Aguarde ${cooldownRemaining}s para enviar um novo comando.`);
      return;
    }

    setMessage(
      isEmergencyAttempt
        ? "Parada de emergência enviada..."
        : "Abrindo / fechando o portão..."
    );

    try {
      const res = await fetch(`/api/open-gate`, { method: "POST" });
      if (!res.ok) {
        setMessage(
          `Acesso negado! Erro: ${res.statusText} - ${res.status} - ${await res.text()}`
        );
        return;
      }

      setMessage(
        isEmergencyAttempt
          ? "Comando de emergência para o portão enviado!"
          : "Enviado comando para abrir/fechar o portão!"
      );
    } catch (error) {
      console.error("Erro ao enviar comando para o portão:", error);
      setMessage("Erro inesperado ao comunicar com o serviço do portão.");
      return;
    }

    startCooldown();
    if (isEmergencyAttempt) {
      clearEmergencyWindow();
    } else {
      startEmergencyWindow();
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
                disabled={cooldownRemaining > 0 && !isEmergencyWindow}
                className={`w-full px-6 py-4 rounded-lg text-lg font-semibold transition transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg ${
                  cooldownRemaining > 0 && !isEmergencyWindow
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed focus:ring-gray-300"
                    : "bg-blue-500 text-white focus:ring-blue-400 hover:bg-blue-600"
                }`}
              >
                {isEmergencyWindow
                  ? "Parar / Cancelar Portão (Emergência)"
                  : "Abrir / Fechar Portão"}
              </button>
            </div>
            <div className="text-center space-y-2">
              {message && (
                <p className="text-red-500 font-semibold">{message}</p>
              )}
              {cooldownRemaining > 0 && (
                <p className="text-sm text-gray-600">
                  Próximo comando liberado em {cooldownRemaining}s.
                  {isEmergencyWindow && " Clique novamente para parar imediatamente."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
