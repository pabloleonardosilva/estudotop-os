"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  CalendarDays,
  FileVideo,
  Clock,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ConsultarOS() {
  const [osList, setOsList] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");

  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  async function buscarOS() {
    let query = supabase
      .from("service_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filtroStatus) query = query.eq("status", filtroStatus);
    if (filtroProfessor) query = query.eq("teacher_id", filtroProfessor);
    if (filtroDisciplina) query = query.eq("subject_id", filtroDisciplina);

    const hoje = new Date();

    if (filtroPeriodo === "hoje") {
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0);

      const fim = new Date();
      fim.setHours(23, 59, 59, 999);

      query = query
        .gte("created_at", inicio.toISOString())
        .lte("created_at", fim.toISOString());
    }

    if (filtroPeriodo === "ultimos_7_dias") {
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);

      const fim = new Date();
      fim.setHours(23, 59, 59, 999);

      query = query
        .gte("created_at", inicio.toISOString())
        .lte("created_at", fim.toISOString());
    }

    if (filtroPeriodo === "este_mes") {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      inicio.setHours(0, 0, 0, 0);

      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      fim.setHours(23, 59, 59, 999);

      query = query
        .gte("created_at", inicio.toISOString())
        .lte("created_at", fim.toISOString());
    }

    if (filtroPeriodo === "personalizado") {
      if (dataInicial) {
        const inicio = new Date(`${dataInicial}T00:00:00`);
        query = query.gte("created_at", inicio.toISOString());
      }

      if (dataFinal) {
        const fim = new Date(`${dataFinal}T23:59:59`);
        query = query.lte("created_at", fim.toISOString());
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar OS:", error);
      return;
    }

    setOsList(data || []);
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
    buscarOS();
    buscarFiltros();
  }, [
    filtroStatus,
    filtroProfessor,
    filtroDisciplina,
    filtroPeriodo,
    dataInicial,
    dataFinal,
  ]);

  function limparFiltros() {
    setFiltroStatus("");
    setFiltroProfessor("");
    setFiltroDisciplina("");
    setFiltroPeriodo("");
    setDataInicial("");
    setDataFinal("");
  }

  function formatarData(data: string) {
    if (!data) return "-";

    return new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function nomeStatus(status: string) {
    if (status === "pendente") return "Pendente";
    if (status === "editando") return "Em edição";
    if (status === "concluido") return "Concluído";
    return status || "-";
  }

  function estiloStatus(status: string) {
    if (status === "pendente") {
      return "bg-slate-100 text-slate-700 ring-slate-200";
    }

    if (status === "editando") {
      return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    if (status === "concluido") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    return "bg-gray-100 text-gray-700 ring-gray-200";
  }

  function minutosParaHoras(minutos: number) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;

    return `${h}h ${String(m).padStart(2, "0")}min`;
  }

  const totalOS = osList.length;

  const totalArquivos = osList.reduce(
    (total, os) => total + Number(os.file_count || 0),
    0
  );

  const totalMinutos = osList.reduce(
    (total, os) => total + Number(os.total_video_minutes || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* TOPO */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              EstudoTOP OS
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              Consultar ordens de serviço
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Acompanhe os envios, edições e conclusões de vídeos do estúdio.
            </p>
          </div>

          <a
            href="/os/nova"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Nova OS
          </a>
        </header>

        {/* FILTROS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-slate-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Filtros
              </h2>
            </div>

            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw size={14} />
              Limpar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <select
              value={filtroProfessor}
              onChange={(e) => setFiltroProfessor(e.target.value)}
              className="input-clean"
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
              className="input-clean"
            >
              <option value="">Todas as disciplinas</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="input-clean"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="editando">Em edição</option>
              <option value="concluido">Concluído</option>
            </select>

            <select
              value={filtroPeriodo}
              onChange={(e) => {
                setFiltroPeriodo(e.target.value);
                setDataInicial("");
                setDataFinal("");
              }}
              className="input-clean"
            >
              <option value="">Todos os períodos</option>
              <option value="hoje">Hoje</option>
              <option value="ultimos_7_dias">Últimos 7 dias</option>
              <option value="este_mes">Este mês</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {filtroPeriodo === "personalizado" && (
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  className="input-clean"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Data final
                </label>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="input-clean"
                />
              </div>
            </div>
          )}
        </section>

        {/* TABELA */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Ordens de serviço
            </h2>
            <p className="text-xs text-slate-500">
              Clique em uma linha para abrir os detalhes da OS.
            </p>
          </div>

          <div className="grid grid-cols-8 gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <div>OS</div>
            <div>Envio</div>
            <div>Professor</div>
            <div>Disciplina</div>
            <div>Arquivos</div>
            <div>Tempo</div>
            <div>Conclusão</div>
            <div>Status</div>
          </div>

          {osList.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhuma OS encontrada para os filtros selecionados.
            </div>
          )}

          {osList.map((os) => (
            <a
              key={os.id}
              href={`/os/${os.id}`}
              className="grid grid-cols-8 gap-3 border-b border-slate-100 px-5 py-4 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <div className="font-semibold text-slate-900">{os.os_number}</div>

              <div className="text-slate-500">{formatarData(os.created_at)}</div>

              <div className="truncate font-medium" title={os.professor_name}>
                {os.professor_name || "-"}
              </div>

              <div className="truncate text-slate-500" title={os.subject_name}>
                {os.subject_name || "-"}
              </div>

              <div>{os.file_count || 0}</div>

              <div>{os.total_video_time || "-"}</div>

              <div className="text-slate-500">
                {os.completed_at ? formatarData(os.completed_at) : "-"}
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estiloStatus(
                    os.status
                  )}`}
                >
                  {nomeStatus(os.status)}
                </span>
              </div>
            </a>
          ))}
        </section>

        {/* MINI DASHBOARD */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MiniCard
            icon={<ClipboardList size={20} />}
            titulo="Total de OS"
            valor={totalOS}
            detalhe="Resultado dos filtros aplicados"
          />

          <MiniCard
            icon={<FileVideo size={20} />}
            titulo="Total de arquivos"
            valor={totalArquivos}
            detalhe="Arquivos nas OS filtradas"
          />

          <MiniCard
            icon={<Clock size={20} />}
            titulo="Tempo total"
            valor={minutosParaHoras(totalMinutos)}
            detalhe="Soma dos tempos das OS filtradas"
          />
        </section>
      </div>

      <style jsx>{`
        .input-clean {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 0.75rem 0.875rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
          outline: none;
          transition: all 0.15s ease;
        }

        .input-clean:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.25);
        }
      `}</style>
    </main>
  );
}

function MiniCard({
  icon,
  titulo,
  valor,
  detalhe,
}: {
  icon: React.ReactNode;
  titulo: string;
  valor: any;
  detalhe: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{valor}</p>
      <p className="mt-1 text-xs text-slate-400">{detalhe}</p>
    </div>
  );
}