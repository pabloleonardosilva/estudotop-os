"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  ClipboardList,
  BarChart3,
  GraduationCap,
  BookOpen,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(path: string) {
    if (path === "/os") return pathname === "/os";
    return pathname === path;
  }

  function itemClass(active: boolean) {
    return active
      ? "flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-slate-950 font-semibold shadow-lg shadow-orange-500/20"
      : "flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-400 font-medium transition hover:bg-white/10 hover:text-white";
  }

  return (
    <aside className="no-print h-screen w-72 shrink-0 border-r border-white/10 bg-[#080b12] px-5 py-6 text-white">
      <div className="mb-8 border-b border-white/10 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
          EstudoTOP
        </p>

        <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">
          Sistema de OS
        </h2>

        <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
      </div>

      <nav className="space-y-7 text-sm">
        <MenuGroup title="Operação">
          <a href="/" className={itemClass(isActive("/"))}>
            <Home size={18} />
            Início
          </a>

          <a href="/os/nova" className={itemClass(isActive("/os/nova"))}>
            <PlusCircle size={18} />
            Cadastrar OS
          </a>

          <a href="/os" className={itemClass(isActive("/os"))}>
            <ClipboardList size={18} />
            Consultar OS
          </a>

          <a href="/dashboard" className={itemClass(isActive("/dashboard"))}>
            <BarChart3 size={18} />
            Dashboard
          </a>
        </MenuGroup>

        <MenuGroup title="Cadastros">
          <a href="/professores" className={itemClass(isActive("/professores"))}>
            <GraduationCap size={18} />
            Professores
          </a>

          <a href="/disciplinas" className={itemClass(isActive("/disciplinas"))}>
            <BookOpen size={18} />
            Disciplinas
          </a>
        </MenuGroup>

        <MenuGroup title="Sistema">
          <a href="#" className={itemClass(false)}>
            <Settings size={18} />
            Configurações
          </a>
        </MenuGroup>
      </nav>
    </aside>
  );
}

function MenuGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <div className="space-y-1">{children}</div>
    </div>
  );
}