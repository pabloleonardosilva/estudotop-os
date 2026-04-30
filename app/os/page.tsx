"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileVideo,
  Loader2,
  Mail,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import SystemModal from "../components/SystemModal";
import PageBackground from "../components/ui/PageBackground";
import PageHeader from "../components/ui/PageHeader";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumSelect from "../components/ui/PremiumSelect";
import PremiumLoadingOverlay from "../components/ui/PremiumLoadingOverlay";
import {
  PremiumTable,
  PremiumTableBody,
  PremiumTableCell,
  PremiumTableHead,
  PremiumTableHeader,
  PremiumTableRow,
} from "../components/ui/PremiumTable";

export default function ConsultarOS() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isOperator = profile?.role === "operator";
  const showActions = isAdmin || isOperator;

  const [osList, setOsList] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [modal, setModal] = useState<any>({
    open: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    onConfirm: null,
    onCancel: null,
  });

  useEffect(() => {
    buscarOS();
    buscarFiltros();
  }, [filtroStatus, filtroProfessor, filtroDisciplina, filtroPeriodo, dataInicial, dataFinal]);

  function fecharModal() {
    setModal({
      open: false,
      title: "",
      message: "",
      type: "info",
      showCancel: false,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: null,
      onCancel: null,
    });
  }

  function abrirModal(config: any) {
    setModal({
      open: true,
      title: config.title || "",
      message: config.message || "",
      type: config.type || "info",
      showCancel: config.showCancel || false,
      confirmText: config.confirmText || "Confirmar",
      cancelText: config.cancelText || "Cancelar",
      onConfirm: config.onConfirm || fecharModal,
      onCancel: config.onCancel || fecharModal,
    });
  }

  async function buscarOS() {
    setLoadingList(true);

    let query = supabase
      .from("service_orders")
      .select(
        `
        *,
        teachers:teacher_id (id, name),
        subjects:subject_id (id, name)
      `
      )
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
      query = query.gte("created_at", inicio.toISOString()).lte("created_at", fim.toISOString());
    }

    if (filtroPeriodo === "ultimos_7_dias") {
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date();
      fim.setHours(23, 59, 59, 999);
      query = query.gte("created_at", inicio.toISOString()).lte("created_at", fim.toISOString());
    }

    if (filtroPeriodo === "este_mes") {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      fim.setHours(23, 59, 59, 999);
      query = query.gte("created_at", inicio.toISOString()).lte("created_at", fim.toISOString());
    }

    if (filtroPeriodo === "personalizado") {
      if (dataInicial) query = query.gte("created_at", new Date(`${dataInicial}T00:00:00`).toISOString());
      if (dataFinal) query = query.lte("created_at", new Date(`${dataFinal}T23:59:59`).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar OS:", error);
      abrirModal({
        title: "Erro ao carregar OS",
        message: "Não foi possível carregar as ordens de serviço.",
        type: "error",
        confirmText: "Entendi",
      });
      setLoadingList(false);
      return;
    }

    setOsList(data || []);
    setLoadingList(false);
  }

  async function buscarFiltros() {
    const { data: teachersData } = await supabase.from("teachers").select("*").order("name");
    const { data: subjectsData } = await supabase.from("subjects").select("*").order("name");

    setTeachers(teachersData || []);
    setSubjects(subjectsData || []);
  }

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
    return new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  function nomeStatus(status: string) {
    if (status === "pendente") return "Pendente";
    if (status === "editando") return "Em edição";
    if (status === "concluido") return "Concluído";
    return status || "-";
  }

  function estiloStatus(status: string) {
    if (status === "pendente") return "bg-amber-50 text-amber-700 ring-amber-200";
    if (status === "editando") return "bg-blue-50 text-blue-700 ring-blue-200";
    if (status === "concluido") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  function emailStatusConfig(status?: string | null) {
    if (status === "sent") {
      return { label: "Enviado", icon: <CheckCircle2 size={14} />, className: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    }
    if (status === "sending") {
      return { label: "Enviando", icon: <Loader2 className="animate-spin" size={14} />, className: "bg-blue-50 text-blue-700 ring-blue-200" };
    }
    if (status === "error") {
      return { label: "Erro", icon: <AlertCircle size={14} />, className: "bg-red-50 text-red-700 ring-red-200" };
    }
    return { label: "Pendente", icon: <Mail size={14} />, className: "bg-amber-50 text-amber-700 ring-amber-200" };
  }

  function minutosParaHoras(minutos: number) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${String(m).padStart(2, "0")}min`;
  }

  function nomeProfessor(os: any) {
    return os.teachers?.name || os.professor_name || "-";
  }

  function nomeDisciplina(os: any) {
    return os.subjects?.name || os.subject_name || "-";
  }

  function estaDentroDas12Horas(createdAt: string) {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    const diffInHours = (Date.now() - created) / (1000 * 60 * 60);
    return diffInHours <= 12;
  }

  function canModifyOS(os: any) {
    if (isAdmin) return true;
    if (!isOperator || !user?.id || !os?.operator_id) return false;
    return String(os.operator_id) === String(user.id) && estaDentroDas12Horas(os.created_at);
  }

  function motivoBloqueio(os: any) {
    if (!isOperator) return "Sem permissão";
    if (!os?.operator_id) return "OS sem operador vinculado";
    if (String(os.operator_id) !== String(user?.id)) return "Criada por outro operador";
    if (!estaDentroDas12Horas(os.created_at)) return "Prazo de 12h expirado";
    return "Sem permissão";
  }

  function solicitarExcluirOS(os: any) {
    if (!canModifyOS(os)) {
      abrirModal({
        title: "Exclusão bloqueada",
        message: `Você não pode excluir esta OS. Motivo: ${motivoBloqueio(os)}.`,
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    abrirModal({
      title: "Excluir OS?",
      message: `Tem certeza que deseja excluir a OS ${os.os_number}? Essa ação não poderá ser desfeita.`,
      type: "warning",
      showCancel: true,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();
        await excluirOS(os);
      },
      onCancel: fecharModal,
    });
  }

  async function excluirOS(os: any) {
    if (!canModifyOS(os)) return;

    const { error } = await supabase.from("service_orders").delete().eq("id", os.id);

    if (error) {
      abrirModal({ title: "Erro ao excluir", message: "Não foi possível excluir esta OS.", type: "error", confirmText: "Entendi" });
      return;
    }

    await buscarOS();
    abrirModal({ title: "OS excluída", message: "A ordem de serviço foi excluída com sucesso.", type: "success", confirmText: "OK" });
  }

  const totalOS = osList.length;
  const totalArquivos = osList.reduce((total, os) => total + Number(os.file_count || 0), 0);
  const totalMinutos = osList.reduce((total, os) => total + Number(os.total_video_minutes || 0), 0);

  return (
    <PageBackground>
      <PremiumLoadingOverlay show={loadingList} title="Carregando OS..." message="Estamos atualizando a lista de ordens de serviço." />

      <PageHeader
        title="Ordens de serviço"
        description="Consulte, filtre, acompanhe e gerencie as ordens de serviço do estúdio."
        action={
          <Link href="/os/nova">
            <PremiumButton icon={<Plus size={18} />}>Nova OS</PremiumButton>
          </Link>
        }
      />

      <PremiumCard
        title="Filtros"
        description="Refine a listagem por professor, disciplina, status ou período."
        icon={<Search size={21} />}
        action={
          <PremiumButton variant="secondary" icon={<RotateCcw size={17} />} onClick={limparFiltros}>
            Limpar
          </PremiumButton>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <PremiumSelect value={filtroStatus} onChange={(e: any) => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="editando">Em edição</option>
            <option value="concluido">Concluído</option>
          </PremiumSelect>

          <PremiumSelect value={filtroProfessor} onChange={(e: any) => setFiltroProfessor(e.target.value)}>
            <option value="">Todos os professores</option>
            {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
          </PremiumSelect>

          <PremiumSelect value={filtroDisciplina} onChange={(e: any) => setFiltroDisciplina(e.target.value)}>
            <option value="">Todas as disciplinas</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </PremiumSelect>

          <PremiumSelect value={filtroPeriodo} onChange={(e: any) => setFiltroPeriodo(e.target.value)}>
            <option value="">Todo o período</option>
            <option value="hoje">Hoje</option>
            <option value="ultimos_7_dias">Últimos 7 dias</option>
            <option value="este_mes">Este mês</option>
            <option value="personalizado">Personalizado</option>
          </PremiumSelect>

          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} disabled={filtroPeriodo !== "personalizado"} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none disabled:opacity-40" />
            <input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} disabled={filtroPeriodo !== "personalizado"} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none disabled:opacity-40" />
          </div>
        </div>
      </PremiumCard>

      <section className="my-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniResumo icon={<ClipboardList size={19} />} label="OS filtradas" value={totalOS} />
        <MiniResumo icon={<FileVideo size={19} />} label="Arquivos" value={totalArquivos} />
        <MiniResumo icon={<Clock size={19} />} label="Tempo total" value={minutosParaHoras(totalMinutos)} />
      </section>

      <div className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/60">
        <PremiumTable>
          <PremiumTableHead>
            <PremiumTableRow>
              <PremiumTableHeader>OS</PremiumTableHeader>
              <PremiumTableHeader>Envio</PremiumTableHeader>
              <PremiumTableHeader>Operador</PremiumTableHeader>
              <PremiumTableHeader>Professor</PremiumTableHeader>
              <PremiumTableHeader>Disciplina</PremiumTableHeader>
              <PremiumTableHeader>Status</PremiumTableHeader>
              <PremiumTableHeader>E-mail</PremiumTableHeader>
              <PremiumTableHeader>Arquivos</PremiumTableHeader>
              <PremiumTableHeader>Tempo</PremiumTableHeader>
              {showActions && <PremiumTableHeader>Ações</PremiumTableHeader>}
            </PremiumTableRow>
          </PremiumTableHead>

          <PremiumTableBody>
            {osList.length === 0 ? (
              <PremiumTableRow>
                <PremiumTableCell colSpan={showActions ? 10 : 9}>
                  <div className="py-8 text-center text-sm text-slate-500">Nenhuma OS encontrada para os filtros selecionados.</div>
                </PremiumTableCell>
              </PremiumTableRow>
            ) : (
              osList.map((os) => {
                const email = emailStatusConfig(os.email_status);

                return (
                  <PremiumTableRow key={os.id}>
                    <PremiumTableCell>
                      <Link href={`/os/${os.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                        {os.os_number}
                      </Link>
                    </PremiumTableCell>
                    <PremiumTableCell>{formatarData(os.created_at)}</PremiumTableCell>
                    <PremiumTableCell>{os.operator_name || "Não registrado"}</PremiumTableCell>
                    <PremiumTableCell>{nomeProfessor(os)}</PremiumTableCell>
                    <PremiumTableCell>{nomeDisciplina(os)}</PremiumTableCell>
                    <PremiumTableCell>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estiloStatus(os.status)}`}>
                        {nomeStatus(os.status)}
                      </span>
                    </PremiumTableCell>
                    <PremiumTableCell>
                      <span title={os.email_error || ""} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${email.className}`}>
                        {email.icon}
                        {email.label}
                      </span>
                    </PremiumTableCell>
                    <PremiumTableCell>{os.file_count || 0}</PremiumTableCell>
                    <PremiumTableCell>{os.total_video_time || "-"}</PremiumTableCell>
                    {showActions && (
                      <PremiumTableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/os/${os.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Abrir</Link>
                          {canModifyOS(os) && (
                            <button type="button" onClick={() => solicitarExcluirOS(os)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </PremiumTableCell>
                    )}
                  </PremiumTableRow>
                );
              })
            )}
          </PremiumTableBody>
        </PremiumTable>
      </div>

      <SystemModal {...modal} />
    </PageBackground>
  );
}

function MiniResumo({ icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-500/20">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
