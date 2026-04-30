"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Plus,
} from "lucide-react";
import { useAuth } from "./contexts/AuthContext";

type UserRole = "admin" | "operator";

type CardItem = {
  titulo: string;
  subtitulo: string;
  icone: React.ReactNode;
  href: string;
  roles: UserRole[];
};

export default function Home() {
  const { profile, loading } = useAuth();

  const userRole = profile?.role as UserRole | undefined;

  const cards: CardItem[] = [
    {
      titulo: "Cadastrar OS",
      subtitulo: "Registre um novo envio para produção.",
      icone: <Plus size={22} />,
      href: "/os/nova",
      roles: ["admin", "operator"],
    },
    {
      titulo: "Consultar OS",
      subtitulo: "Acompanhe pendências e conclusões.",
      icone: <ClipboardList size={22} />,
      href: "/os",
      roles: ["admin", "operator"],
    },
    {
      titulo: "Professores",
      subtitulo: "Consulte e cadastre professores.",
      icone: <GraduationCap size={22} />,
      href: "/professores",
      roles: ["admin", "operator"],
    },
    {
      titulo: "Disciplinas",
      subtitulo: "Consulte e cadastre disciplinas.",
      icone: <BookOpen size={22} />,
      href: "/disciplinas",
      roles: ["admin", "operator"],
    },
    {
      titulo: "Dashboard",
      subtitulo: "Indicadores estratégicos da produção.",
      icone: <BarChart3 size={22} />,
      href: "/dashboard",
      roles: ["admin"],
    },
  ];

  const visibleCards = cards.filter((card) => {
    if (!userRole) return false;
    return card.roles.includes(userRole);
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e9e9ec]">
        <div className="rounded-3xl border border-white/70 bg-white px-8 py-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-500">
            EstudoTOP OS
          </p>
          <p className="mt-3 text-sm text-slate-500">Carregando painel...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e9e9ec] px-4 py-7 md:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-gradient-to-r from-white via-white to-orange-50 p-8 shadow-sm ring-1 ring-slate-200/60 md:p-10">
          <div className="absolute right-0 top-0 h-56 w-56 translate-x-20 -translate-y-24 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-40 h-44 w-44 translate-y-24 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500 via-amber-400 to-transparent" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-500">
              EstudoTOP OS
            </p>

            <h1 className="mt-4 text-4xl font-medium tracking-tight text-slate-950 md:text-5xl">
              Painel inicial
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Acesse rapidamente os módulos disponíveis para o seu perfil de
              usuário.
            </p>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visibleCards.map((card) => (
            <Link key={card.titulo} href={card.href} className="group">
              <article className="relative flex min-h-[245px] flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm ring-1 ring-slate-200/60 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10">
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-16 -translate-y-16 rounded-full bg-orange-500/10 blur-3xl transition group-hover:bg-orange-500/20" />
                <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-10 translate-y-10 rounded-full bg-amber-400/10 blur-2xl" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#080b12] text-orange-400 shadow-xl shadow-slate-900/15 ring-1 ring-white/10 transition duration-300 group-hover:scale-105 group-hover:text-amber-300">
                  {card.icone}
                </div>

                <div className="relative mt-8 flex-1">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                    {card.titulo}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {card.subtitulo}
                  </p>
                </div>

                <div className="relative mt-7 border-t border-slate-200 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                      Acessar
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300 transition-all duration-300 group-hover:w-full" />
              </article>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}