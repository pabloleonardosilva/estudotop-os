"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const isLoginPage = pathname === "/login";

  const isAdminOnlyRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/usuarios");

  const isOperatorTryingAdminRoute =
    profile?.role === "operator" && isAdminOnlyRoute;

  useEffect(() => {
    if (loading) return;

    if (!user && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (user && isLoginPage) {
      router.replace("/");
      return;
    }

    if (isOperatorTryingAdminRoute) {
      router.replace("/os");
      return;
    }
  }, [
    user,
    profile,
    loading,
    pathname,
    isLoginPage,
    isOperatorTryingAdminRoute,
    router,
  ]);

  if (loading) {
    return <LoadingScreen message="Carregando sistema..." />;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  if (isOperatorTryingAdminRoute) {
    return <LoadingScreen message="Redirecionando..." />;
  }

  return (
  <div className="flex min-h-screen bg-[#e9e9ec]">
    <Sidebar />

    <div className="flex-1">
      <Header />
      <main>{children}</main>
    </div>
  </div>
);

function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12]">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-center text-white shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">
          EstudoTOP OS
        </p>

        <p className="mt-3 text-sm text-slate-300">{message}</p>
      </div>
    </main>
  );
}
}