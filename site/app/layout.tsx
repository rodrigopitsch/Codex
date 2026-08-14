import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sala de Jogos",
  description: "Jogo da Velha e Ludo para jogar no celular, sozinho ou com outra pessoa.",
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
