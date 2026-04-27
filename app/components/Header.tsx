"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  function menuClass(ativo: boolean) {
    return ativo
      ? "rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-slate-950 shadow-lg shadow-orange-500/20"
      : "rounded-2xl px-5 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white";
  }

  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/10 bg-[#080b12] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <Image
            src="/logo-estudotop.webp"
            alt="EstudoTOP"
            width={80}
            height={80}
            priority
            className="h-20 w-auto"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
              EstudoTOP
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Sistema de OS
            </h1>
          </div>
        </div>

        <nav className="flex items-center gap-2 text-sm font-medium">
          <a href="/" className={menuClass(pathname === "/")}>
            Início
          </a>

          <a href="/os" className={menuClass(pathname.startsWith("/os"))}>
            OS
          </a>

          <a href="/dashboard" className={menuClass(pathname === "/dashboard")}>
            Dashboard
          </a>
        </nav>
      </div>
    </header>
  );
}