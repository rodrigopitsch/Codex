import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sala de Jogos",
  description: "Jogo da Velha, Ludo e Paciência Trilha para jogar no celular sem instalar.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sala de Jogos",
  },
  other: { "codex-preview": "development" },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
