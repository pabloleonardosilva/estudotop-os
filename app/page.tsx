import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Plus,
} from "lucide-react";

export default function Home() {
  const cards = [
    {
      titulo: "Cadastrar OS",
      subtitulo: "Registrar novo envio de vídeos gravados em estúdio.",
      icon: Plus,
      href: "/os/nova",
      gradient: "from-blue-600 to-indigo-600",
      glow: "shadow-blue-500/20",
      ring: "ring-blue-100",
    },
    {
      titulo: "Consultar OS",
      subtitulo: "Acompanhar pendências, edições e conclusões.",
      icon: ClipboardList,
      href: "/os",
      gradient: "from-slate-900 to-slate-700",
      glow: "shadow-slate-500/20",
      ring: "ring-slate-100",
    },
    {
      titulo: "Dashboard",
      subtitulo: "Visualizar métricas mensais e produtividade.",
      icon: BarChart3,
      href: "/dashboard",
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      ring: "ring-emerald-100",
    },
    {
      titulo: "Professores",
      subtitulo: "Consultar e gerenciar professores cadastrados.",
      icon: GraduationCap,
      href: "/professores",
      gradient: "from-violet-600 to-fuchsia-600",
      glow: "shadow-violet-500/20",
      ring: "ring-violet-100",
    },
    {
      titulo: "Disciplinas",
      subtitulo: "Consultar e gerenciar matérias e disciplinas.",
      icon: BookOpen,
      href: "/disciplinas",
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      ring: "ring-amber-100",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff_0,#f8fafc_32%,#eef2f7_100%)] px-4 py-8 md:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-16 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="absolute bottom-0 right-24 h-32 w-32 translate-y-16 rounded-full bg-amber-400/10 blur-2xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              EstudoTOP OS
            </p>

            <h1 className="mt-3 text-4xl font-medium tracking-tight text-slate-950">
              Painel inicial
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Acesse rapidamente os módulos essenciais do sistema de ordens de
              serviço, produção e acompanhamento.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <a
                key={card.titulo}
                href={card.href}
                className={`group relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-white p-6 shadow-sm ring-1 ${card.ring} transition duration-300 hover:-translate-y-1 hover:shadow-xl ${card.glow}`}
              >
                <div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-xl transition group-hover:opacity-20`}
                />

                <div className="relative mb-8 flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg ${card.glow}`}
                  >
                    <Icon size={24} strokeWidth={2} />
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                    <ArrowRight size={17} />
                  </span>
                </div>

                <div className="relative">
                  <h2 className="text-xl font-medium tracking-tight text-slate-950">
                    {card.titulo}
                  </h2>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                    {card.subtitulo}
                  </p>

                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Acessar módulo
                    </span>

                    <span
                      className={`h-1.5 w-14 rounded-full bg-gradient-to-r ${card.gradient} opacity-70 transition group-hover:w-20 group-hover:opacity-100`}
                    />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}