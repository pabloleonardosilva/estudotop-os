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

      <div className="flex min-h-screen flex-1 flex-col">
        <Header />

        <main>{children}</main>

        <footer className="px-6 pb-5 pt-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 text-center text-xs text-slate-500 shadow-sm backdrop-blur">
            <p className="font-semibold tracking-[0.16em] text-slate-400">
              ESTUDOTOP OS v1.0
            </p>

            <p className="mt-1">
              Desenvolvido por{" "}
              <span className="font-semibold text-slate-700">
                Pablo Leonardo
              </span>{" "}
              · EstudoTOP
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

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