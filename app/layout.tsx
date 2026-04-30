import "./globals.css";
import AppShell from "./components/AppShell";
import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "EstudoTOP OS",
  description: "Sistema de controle de ordens de serviço",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-[#f5f6f8] font-sans text-slate-800">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}