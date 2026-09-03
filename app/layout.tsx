import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "CAF — Cadastro do Atleta de Futevôlei",
  description: "Identificação digital oficial de atletas de futevôlei.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
