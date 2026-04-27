"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  FileVideo,
  Film,
  FolderOpen,
  Plus,
  Trophy,
} from "lucide-react";

export default function Dashboard() {
  const [dados, setDados] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  async function buscarDados() {
    const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const fim = `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

    let query = supabase
      .from("service_orders")
      .select("*")
      .gte("created_at", inicio)
      .lte("created_at", fim)
      .order("created_at", { ascending: false });

    if (filtroProfessor) query = query.eq("teacher_id", filtroProfessor);
    if (filtroDisciplina) query = query.eq("subject_id", filtroDisciplina);

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar dados:", error);
      return;
    }

    setDados(data || []);
  }

  async function buscarFiltros() {
    const { data: teachersData } = await supabase
      .from("teachers")
      .select("*")
      .order("name");

    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*")
      .order("name");

    setTeachers(teachersData || []);
    setSubjects(subjectsData || []);
  }

  useEffect(() => {
    buscarDados();
    buscarFiltros();
  }, [mes, ano, filtroProfessor, filtroDisciplina]);

  function minutosParaHoras(minutos: number) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${String(m).padStart(2, "0")}min`;
  }

  const totalOS = dados.length;

  const totalArquivos = dados.reduce(
    (total, os) => total + Number(os.file_count || 0),
    0
  );

  const pendentes = dados.filter((os) => os.status === "pendente");
  const editando = dados.filter((os) => os.status === "editando");
  const concluidos = dados.filter((os) => os.status === "concluido");

  const totalMinutosRecebidos = dados.reduce(
    (total, os) => total + Number(os.total_video_minutes || 0),
    0
  );

  const totalMinutosConcluidos = concluidos.reduce(
    (total, os) => total + Number(os.total_video_minutes || 0),
    0
  );

  const percentualConcluido =
    totalMinutosRecebidos > 0
      ? Math.round((totalMinutosConcluidos / totalMinutosRecebidos) * 100)
      : 0;

  const statusData = [
    { name: "Pendente", value: pendentes.length, color: "#f59e0b" },
    { name: "Em edição", value: editando.length, color: "#2563eb" },
    { name: "Concluído", value: concluidos.length, color: "#22c55e" },
  ];

  const horasData = [
    {
      name: "Recebidas",
      horas: Number((totalMinutosRecebidos / 60).toFixed(2)),
      color: "#f59e0b",
    },
    {
      name: "Concluídas",
      horas: Number((totalMinutosConcluidos / 60).toFixed(2)),
      color: "#22c55e",
    },
  ];

  const rankingProfessores = teachers
    .map((teacher) => {
      const osDoProfessor = dados.filter(
        (os) => String(os.teacher_id) === String(teacher.id)
      );

      const minutos = osDoProfessor.reduce(
        (total, os) => total + Number(os.total_video_minutes || 0),
        0
      );

      return {
        name: teacher.name,
        totalOS: osDoProfessor.length,
        minutos,
      };
    })
    .filter((item) => item.totalOS > 0)
    .sort((a, b) => b.minutos - a.minutos)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef4ff_0,#f7f8fb_34%,#eef2f7_100%)] px-4 py-8 md:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="relative mb-7 overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-sm backdrop-blur">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-16 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="absolute bottom-0 right-24 h-32 w-32 translate-y-16 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                EstudoTOP OS
              </p>

              <h1 className="mt-3 text-4xl font-medium tracking-tight text-slate-950">
                Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Acompanhe a produção mensal, status das ordens de serviço e
                carga de vídeos por professor.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-right text-xs text-slate-500 shadow-sm">
              <p>
                {String(new Date().getDate()).padStart(2, "0")}/
                {String(new Date().getMonth() + 1).padStart(2, "0")}/
                {new Date().getFullYear()}
              </p>
              <p className="mt-1 font-medium text-slate-800">
                {String(new Date().getHours()).padStart(2, "0")}:
                {String(new Date().getMinutes()).padStart(2, "0")}
              </p>
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-1 gap-3 rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur md:grid-cols-6">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value={1}>Janeiro</option>
            <option value={2}>Fevereiro</option>
            <option value={3}>Março</option>
            <option value={4}>Abril</option>
            <option value={5}>Maio</option>
            <option value={6}>Junho</option>
            <option value={7}>Julho</option>
            <option value={8}>Agosto</option>
            <option value={9}>Setembro</option>
            <option value={10}>Outubro</option>
            <option value={11}>Novembro</option>
            <option value={12}>Dezembro</option>
          </select>

          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />

          <select
            value={filtroProfessor}
            onChange={(e) => setFiltroProfessor(e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 md:col-span-2"
          >
            <option value="">Todos os professores</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>

          <select
            value={filtroDisciplina}
            onChange={(e) => setFiltroDisciplina(e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 md:col-span-2"
          >
            <option value="">Todas as disciplinas</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </section>

        <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total de OS"
            value={totalOS}
            icon={<FolderOpen size={20} />}
            gradient="from-blue-600 to-indigo-600"
          />
          <MetricCard
            title="Arquivos enviados"
            value={totalArquivos}
            icon={<FileVideo size={20} />}
            gradient="from-violet-600 to-fuchsia-600"
          />
          <MetricCard
            title="Horas recebidas"
            value={minutosParaHoras(totalMinutosRecebidos)}
            icon={<Clock3 size={20} />}
            gradient="from-amber-500 to-orange-600"
          />
          <MetricCard
            title="Horas concluídas"
            value={minutosParaHoras(totalMinutosConcluidos)}
            icon={<Film size={20} />}
            gradient="from-emerald-500 to-teal-600"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Painel titulo="Produtividade do mês" icon={<CalendarDays size={18} />}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Percentual de horas concluídas em relação às recebidas.
                </p>
                <p className="mt-4 text-5xl font-medium tracking-tight text-slate-950">
                  {percentualConcluido}%
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {concluidos.length} concluídas
              </div>
            </div>

            <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${percentualConcluido}%` }}
              />
            </div>

            <div className="mt-6 divide-y divide-slate-100">
              <LinhaResumo label="Total de OS" valor={totalOS} />
              <LinhaResumo label="Arquivos enviados" valor={totalArquivos} />
              <LinhaResumo
                label="Horas recebidas"
                valor={minutosParaHoras(totalMinutosRecebidos)}
              />
              <LinhaResumo
                label="Horas concluídas"
                valor={minutosParaHoras(totalMinutosConcluidos)}
              />
            </div>
          </Painel>

          <Painel titulo="OS por status" icon={<BarChart3 size={18} />}>
            <div className="space-y-4">
              <BarraStatus
                label="Pendente"
                valor={pendentes.length}
                total={totalOS}
                cor="bg-amber-500"
              />

              <BarraStatus
                label="Em edição"
                valor={editando.length}
                total={totalOS}
                cor="bg-blue-600"
              />

              <BarraStatus
                label="Concluído"
                valor={concluidos.length}
                total={totalOS}
                cor="bg-emerald-500"
              />
            </div>

            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                    {statusData.map((item, index) => (
                      <Cell key={index} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Painel>

          <Painel titulo="Recebidas x concluídas" icon={<Film size={18} />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MiniIndicador
                titulo="Recebidas"
                valor={minutosParaHoras(totalMinutosRecebidos)}
                cor="bg-amber-500"
              />
              <MiniIndicador
                titulo="Concluídas"
                valor={minutosParaHoras(totalMinutosConcluidos)}
                cor="bg-emerald-500"
              />
            </div>

            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horasData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="horas" radius={[10, 10, 0, 0]}>
                    {horasData.map((item, index) => (
                      <Cell key={index} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Painel>

          <Painel titulo="Carga por professor" icon={<Trophy size={18} />}>
            {rankingProfessores.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Nenhum dado encontrado para os filtros selecionados.
              </p>
            ) : (
              <div className="space-y-4">
                {rankingProfessores.map((professor) => {
                  const largura =
                    totalMinutosRecebidos > 0
                      ? Math.max(
                          6,
                          Math.round(
                            (professor.minutos / totalMinutosRecebidos) * 100
                          )
                        )
                      : 0;

                  return (
                    <div key={professor.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {professor.name}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {minutosParaHoras(professor.minutos)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${largura}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Painel>
        </section>

        <footer className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-500">
            Painel operacional baseado nas OS registradas no Supabase.
          </p>

          <div className="flex gap-3">
            <a
              href="/os"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Ver OS
            </a>

            <a
              href="/os/nova"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
            >
              <Plus size={16} />
              Nova OS
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-2xl font-medium tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Painel({
  titulo,
  icon,
  children,
}: {
  titulo: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
          {icon}
        </div>

        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {titulo}
        </h2>
      </div>

      {children}
    </div>
  );
}

function LinhaResumo({ label, valor }: { label: string; valor: any }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{valor}</span>
    </div>
  );
}

function BarraStatus({
  label,
  valor,
  total,
  cor,
}: {
  label: string;
  valor: number;
  total: number;
  cor: string;
}) {
  const largura = total > 0 ? Math.max(6, Math.round((valor / total) * 100)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-medium text-slate-900">{valor}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${cor}`}
          style={{ width: `${largura}%` }}
        />
      </div>
    </div>
  );
}

function MiniIndicador({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`mb-3 h-2 w-12 rounded-full ${cor}`} />
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{valor}</p>
    </div>
  );
}