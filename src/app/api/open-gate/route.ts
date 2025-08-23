// src/api/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId, getToken } = await auth();
  if (!userId) {
    // Usar NextResponse para respostas JSON padronizadas no Next.js
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Pega o JWT emitido pelo Clerk. A função getToken() SIM é uma promessa.
  const jwt = await getToken();

  if (!jwt) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/portao/abrir`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    // Se a resposta do backend não for OK, repassamos o erro.
    if (!res.ok) {
      const errorBody = await res.json();
      return NextResponse.json(
        { error: "Acesso negado pelo backend", details: errorBody },
        { status: res.status }
      );
    }

    const backendResponse = await res.json();
    return NextResponse.json(backendResponse);
  } catch (error) {
    console.error("Erro ao conectar com o backend:", error);
    return NextResponse.json(
      { error: "Erro interno ao contatar o serviço do portão." },
      { status: 500 }
    );
  }
}
