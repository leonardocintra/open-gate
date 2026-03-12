This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Visão Geral do Sistema

> **Open Gate** é o **frontend** que autentica o usuário e envia comandos para o portão por meio da `leonardo-api`.

```mermaid
flowchart TD
	A[Usuário acessa o frontend<br/>Open Gate] --> B{Login via Google OAuth}
	B -- Falha --> Z[Sem acesso à página]
	B -- Sucesso --> C[Frontend consulta leonardo-api<br/>/validate]
	C --> D{Usuário cadastrado?}
	D -- Não --> Z
	D -- Sim --> E[Dashboard do frontend
	com botão do portão]
	E --> F[Usuário clica no botão
	Abrir/Fechar]
	F --> G[Frontend chama leonardo-api<br/>/open-gate]
	G --> H[leonardo-api publica comando
	na fila MQTT]
	H --> I[ESP32 escuta a fila]
	I --> J[ESP32 aciona o portão]

	classDef frontend fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,font-weight:700
	class A,E,F frontend

	classDef backend fill:#ede9fe,stroke:#6d28d9,color:#4c1d95
	class C,G backend

	classDef infra fill:#fef3c7,stroke:#d97706,color:#92400e
	class H infra

	classDef device fill:#dcfce7,stroke:#15803d,color:#166534
	class I,J device
```

## Diagrama C4 Simplificado

> Representação visual (nível de contexto) mostrando como o frontend interage com os demais componentes.

```mermaid
C4Context
	title Open Gate - Contexto

	Person(usuario, "Usuário", "Controla o portão pelo navegador")

	System(frontend, "Open Gate (Frontend)", "Next.js + Clerk")

	System_Ext(api, "leonardo-api", "Valida usuários e publica comandos")
	System_Ext(mqtt, "Fila MQTT", "Canal de eventos para o portão")
	System_Ext(esp32, "ESP32", "Dispositivo físico conectado ao portão")

	Rel(usuario, frontend, "Login Google OAuth / clique no botão")
	Rel(frontend, api, "Validação e comando", "HTTPS")
	Rel(api, mqtt, "Publica evento abrir/fechar", "MQTT")
	Rel(mqtt, esp32, "Entrega evento")
	Rel(esp32, usuario, "Aciona portão e confirma")
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
