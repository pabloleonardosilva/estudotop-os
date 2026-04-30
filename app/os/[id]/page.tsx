"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  ExternalLink,
  FileDown,
  FileText,
  Files,
  History,
  Link as LinkIcon,
  Loader2,
  Mail,
  Printer,
  RefreshCcw,
  Send,
  User,
  UserRound,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import SystemModal from "../../components/SystemModal";
import PageBackground from "../../components/ui/PageBackground";
import PageHeader from "../../components/ui/PageHeader";
import PremiumButton from "../../components/ui/PremiumButton";
import PremiumCard from "../../components/ui/PremiumCard";
import PremiumLoadingOverlay from "../../components/ui/PremiumLoadingOverlay";

export default function DetalheOS() {
  const { id } = useParams();
  const { user, profile } = useAuth();

  const [os, setOs] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [statusToConfirm, setStatusToConfirm] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [toast, setToast] = useState<any>(null);

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

  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node)
      ) {
        setStatusMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setStatusMenuOpen(false);
        setStatusToConfirm(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  async function carregarTudo() {
    setLoadingPage(true);
    await Promise.all([carregarOS(), carregarHistorico()]);
    setLoadingPage(false);
  }

  async function carregarOS() {
    const { data, error } = await supabase
      .from("service_orders")
      .select(
        `
        *,
        teachers:teacher_id (id, name),
        subjects:subject_id (id, name)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao carregar OS:", error);
      abrirModal({
        title: "Erro ao carregar OS",
        message: "Não foi possível carregar os dados desta ordem de serviço.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    setOs(data);
  }

  async function carregarHistorico() {
    const { data, error } = await supabase
      .from("service_order_history")
      .select("*")
      .eq("service_order_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar histórico:", error);
      return;
    }

    setHistory(data || []);
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
      return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    if (status === "editando") {
      return "bg-blue-50 text-blue-700 ring-blue-200";
    }

    if (status === "concluido") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  function statusConfig(status: string) {
    if (status === "concluido") {
      return {
        label: "Concluído",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        soft: "from-emerald-50 to-white",
      };
    }

    if (status === "editando") {
      return {
        label: "Em edição",
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        soft: "from-blue-50 to-white",
      };
    }

    return {
      label: "Pendente",
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      soft: "from-amber-50 to-white",
    };
  }

  function emailStatusConfig(status?: string | null) {
    if (status === "sent") {
      return {
        label: "E-mail enviado",
        description: os?.email_sent_at
          ? `Enviado em ${formatarData(os.email_sent_at)}`
          : "O e-mail da OS foi enviado com sucesso.",
        icon: <CheckCircle2 size={20} />,
        dot: "bg-emerald-500",
        card: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
        buttonLabel: "Reenviar e-mail",
      };
    }

    if (status === "sending") {
      return {
        label: "Enviando e-mail",
        description: "O sistema está gerando o PDF e enviando a mensagem.",
        icon: <Loader2 className="animate-spin" size={20} />,
        dot: "bg-blue-500",
        card: "border-blue-200 bg-blue-50/70 text-blue-800",
        buttonLabel: "Enviando...",
      };
    }

    if (status === "error") {
      return {
        label: "Erro no e-mail",
        description:
          os?.email_error ||
          "Houve uma falha ao enviar o e-mail. Você pode tentar reenviar.",
        icon: <AlertCircle size={20} />,
        dot: "bg-red-500",
        card: "border-red-200 bg-red-50/70 text-red-800",
        buttonLabel: "Reenviar e-mail",
      };
    }

    return {
      label: "E-mail pendente",
      description: "O e-mail ainda não foi confirmado como enviado.",
      icon: <Mail size={20} />,
      dot: "bg-amber-500",
      card: "border-amber-200 bg-amber-50/70 text-amber-800",
      buttonLabel: "Enviar e-mail",
    };
  }

  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "editando", label: "Em edição" },
    { value: "concluido", label: "Concluído" },
  ];

  function solicitarAlteracaoStatus(novoStatus: string) {
    if (!os) return;

    if (novoStatus === os.status) {
      setStatusMenuOpen(false);
      return;
    }

    setStatusToConfirm(novoStatus);
    setStatusMenuOpen(false);
  }

  function cancelarAlteracaoStatus() {
    setStatusToConfirm(null);
  }

  function nomeProfessor() {
    return os?.teachers?.name || os?.professor_name || "-";
  }

  function nomeDisciplina() {
    return os?.subjects?.name || os?.subject_name || "-";
  }

  function estaDentroDe12Horas(createdAt: string) {
    if (!createdAt) return false;

    const criadoEm = new Date(createdAt).getTime();
    const agora = Date.now();
    const diferencaEmHoras = (agora - criadoEm) / (1000 * 60 * 60);

    return diferencaEmHoras <= 12;
  }

  function podeEditarOS() {
    if (!os || !user || !profile) return false;

    if (profile.role === "admin") {
      return true;
    }

    if (profile.role === "operator") {
      return os.operator_id === user.id && estaDentroDe12Horas(os.created_at);
    }

    return false;
  }

  function podeReenviarEmail() {
    if (!os || !profile) return false;
    return profile.role === "admin" || profile.role === "operator";
  }

  async function alterarStatus(novoStatus: string) {
    if (!os || !user || changingStatus) return;

    const statusAnterior = os.status;

    if (statusAnterior === novoStatus) return;

    setChangingStatus(true);

    const updateData: any = {
      status: novoStatus,
    };

    if (novoStatus === "concluido") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    const { error } = await supabase
      .from("service_orders")
      .update(updateData)
      .eq("id", id);

    if (error) {
      setChangingStatus(false);
      console.error("Erro ao alterar status:", error);
      abrirModal({
        title: "Erro ao alterar status",
        message: error.message,
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    const { error: historyError } = await supabase
      .from("service_order_history")
      .insert([
        {
          service_order_id: Number(id),
          user_id: user.id,
          user_name: profile?.name || user.email,
          action: "status_changed",
          description: `Status alterado por ${
            profile?.name || user.email
          }: ${nomeStatus(statusAnterior)} → ${nomeStatus(novoStatus)}.`,
        },
      ]);

    if (historyError) {
      console.error("Erro ao gravar histórico:", historyError);
      abrirModal({
        title: "Status alterado",
        message: `O status foi alterado, mas houve erro ao registrar no histórico: ${historyError.message}`,
        type: "warning",
        confirmText: "Entendi",
      });
    }

    setStatusToConfirm(null);
    await carregarOS();
    await carregarHistorico();
    setChangingStatus(false);
  }

  function showToast(config: any) {
    setToast({
      type: config.type || "info",
      title: config.title || "",
      message: config.message || "",
    });

    window.setTimeout(() => {
      setToast(null);
    }, config.duration || 4200);
  }

  async function reenviarEmail() {
    if (!os || resendingEmail) return;

    setResendingEmail(true);

    showToast({
      type: "info",
      title: "Enviando e-mail...",
      message: "O sistema está gerando o PDF e tentando enviar a mensagem.",
      duration: 2600,
    });
    setOs((current: any) =>
      current
        ? {
            ...current,
            email_status: "sending",
            email_error: null,
          }
        : current
    );

    try {
      const response = await fetch("/api/os/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ osId: os.id, force: true }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || "Não foi possível reenviar o e-mail.");
      }

      await carregarOS();

      showToast({
        type: "success",
        title: "E-mail enviado",
        message: "O e-mail da OS foi reenviado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao reenviar e-mail:", error);
      await carregarOS();

      showToast({
        type: "error",
        title: "Erro ao reenviar e-mail",
        message:
          error?.message ||
          "O sistema não conseguiu reenviar o e-mail. Verifique o status salvo na OS.",
        duration: 6500,
      });
    } finally {
      setResendingEmail(false);
    }
  }

  if (loadingPage || !os) {
    return (
      <PageBackground>
        <div className="rounded-[2rem] border border-white/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-500/20">
              <Loader2 className="animate-spin" size={22} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                EstudoTOP OS
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Carregando dados da OS...
              </p>
            </div>
          </div>
        </div>

        <SystemModal {...modal} />
      </PageBackground>
    );
  }

  const canEdit = podeEditarOS();
  const emailConfig = emailStatusConfig(os.email_status);

  return (
    <PageBackground>
      <PremiumLoadingOverlay
        show={resendingEmail}
        title="Enviando e-mail..."
        message="Estamos gerando o PDF da OS e enviando a mensagem novamente."
      />

      <PremiumLoadingOverlay
        show={changingStatus}
        title="Alterando status..."
        message="Aguarde enquanto o andamento da OS é atualizado."
      />

      <PageHeader
        title={os.os_number}
        description="Detalhamento completo da ordem de serviço."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/os">
              <PremiumButton variant="secondary" icon={<ArrowLeft size={17} />}>
                Voltar
              </PremiumButton>
            </Link>

            {canEdit && (
              <Link href={`/os/${os.id}/editar`}>
                <PremiumButton variant="secondary" icon={<Edit3 size={17} />}>
                  Editar
                </PremiumButton>
              </Link>
            )}

            <Link href={`/os/${os.id}/print`}>
              <PremiumButton icon={<Printer size={17} />}>Imprimir</PremiumButton>
            </Link>

            <Link href={`/os/${os.id}/pdf`}>
              <PremiumButton icon={<FileDown size={17} />}>Gerar PDF</PremiumButton>
            </Link>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ring-1 ${estiloStatus(
            os.status
          )}`}
        >
          {nomeStatus(os.status)}
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
          Criada em {formatarData(os.created_at)}
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
          Operador: {os.operator_name || "Não registrado"}
        </span>

        {!canEdit && profile?.role === "operator" && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 shadow-sm">
            Edição bloqueada
          </span>
        )}
      </div>

      <section
        className={`mb-5 rounded-[2rem] border p-5 shadow-sm ring-1 ring-slate-200/60 ${emailConfig.card}`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
              {emailConfig.icon}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${emailConfig.dot}`} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  Status do e-mail
                </p>
              </div>

              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                {emailConfig.label}
              </h3>

              <p className="mt-1 max-w-3xl whitespace-pre-line text-sm leading-6 opacity-80">
                {emailConfig.description}
              </p>
            </div>
          </div>

          {podeReenviarEmail() && (
            <button
              type="button"
              onClick={reenviarEmail}
              disabled={resendingEmail || os.email_status === "sending"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#080b12] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {resendingEmail || os.email_status === "sending" ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Send size={17} />
              )}
              {emailConfig.buttonLabel}
            </button>
          )}
        </div>
      </section>

      {profile?.role === "admin" && (
        <section
          className={`mb-5 rounded-[2rem] border border-white/80 bg-gradient-to-r ${
            statusConfig(os.status).soft
          } p-5 shadow-sm ring-1 ring-slate-200/60 backdrop-blur`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20">
                <RefreshCcw size={20} />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Status da OS
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                  {statusConfig(os.status).label}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Somente administradores podem alterar o andamento da ordem de
                  serviço.
                </p>
              </div>
            </div>

            <div className="relative" ref={statusMenuRef}>
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className={`inline-flex min-w-[220px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                  statusConfig(os.status).badge
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      statusConfig(os.status).dot
                    }`}
                  />
                  {statusConfig(os.status).label}
                </span>

                <ChevronDown size={16} />
              </button>

              {statusMenuOpen && (
                <div className="absolute right-0 z-30 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-white/80 bg-white shadow-2xl ring-1 ring-slate-200/70">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Alterar status
                    </p>
                  </div>

                  <div className="p-2">
                    {statusOptions.map((option) => {
                      const config = statusConfig(option.value);
                      const active = os.status === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => solicitarAlteracaoStatus(option.value)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm transition ${
                            active
                              ? "bg-slate-100 font-semibold text-slate-900"
                              : "text-slate-600 hover:bg-orange-50 hover:text-slate-900"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
                            />
                            {option.label}
                          </span>

                          {active && (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <InfoCard
          icon={<CalendarDays size={20} />}
          label="Data de envio"
          value={formatarData(os.created_at)}
        />

        <InfoCard
          icon={<Files size={20} />}
          label="Arquivos"
          value={os.file_count || 0}
        />

        <InfoCard
          icon={<Clock size={20} />}
          label="Tempo total"
          value={os.total_video_time || "-"}
        />

        <InfoCard
          icon={<CheckCircle2 size={20} />}
          label="Conclusão"
          value={os.completed_at ? formatarData(os.completed_at) : "-"}
        />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PremiumCard
          title="Professor e disciplina"
          description="Dados principais da gravação."
          icon={<UserRound size={21} />}
        >
          <DetailItem
            icon={<UserRound size={18} />}
            label="Professor"
            value={nomeProfessor()}
          />

          <DetailItem
            icon={<BookOpen size={18} />}
            label="Disciplina"
            value={nomeDisciplina()}
          />
        </PremiumCard>

        <PremiumCard
          title="Produção"
          description="Dados técnicos da OS."
          icon={<Files size={21} />}
        >
          <DetailItem
            icon={<Files size={18} />}
            label="Arquivos"
            value={os.file_count || 0}
          />

          <DetailItem
            icon={<Clock size={18} />}
            label="Tempo dos vídeos"
            value={os.total_video_time || "-"}
          />

          <DetailItem
            icon={<Clock size={18} />}
            label="Tempo em minutos"
            value={os.total_video_minutes || 0}
          />

          <DetailItem
            icon={<User size={18} />}
            label="Operador"
            value={os.operator_name || "Não registrado"}
          />
        </PremiumCard>
      </section>

      <section className="mt-5">
        <PremiumCard
          title="Google Drive"
          description="Acesso aos arquivos enviados."
          icon={<LinkIcon size={21} />}
        >
          {os.drive_link ? (
            <a
              href={os.drive_link}
              target="_blank"
              className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/60 p-4 text-sm text-orange-700 hover:bg-orange-100"
            >
              <LinkIcon size={18} />
              <span className="break-all">{os.drive_link}</span>
              <ExternalLink size={16} className="ml-auto" />
            </a>
          ) : (
            <p className="text-sm text-slate-500">Nenhum link informado.</p>
          )}
        </PremiumCard>
      </section>

      <section className="mt-5">
        <PremiumCard
          title="Observações"
          description="Detalhes adicionais da OS."
          icon={<FileText size={21} />}
        >
          <p className="text-sm leading-6 text-slate-600">
            {os.notes || "Nenhuma observação registrada."}
          </p>
        </PremiumCard>
      </section>

      <section className="mt-5">
        <PremiumCard
          title="Histórico da OS"
          description="Registro de criação e alterações da ordem de serviço."
          icon={<History size={21} />}
        >
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum histórico registrado para esta OS.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {item.description || item.action}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{item.user_name || "Usuário"}</span>
                    <span>{formatarData(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </section>

      {statusToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl ring-1 ring-slate-200/70">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20">
                <RefreshCcw size={20} />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-500">
                  Confirmar alteração
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                  Alterar status da OS?
                </h3>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-500">
              Você está alterando o status de{" "}
              <strong className="text-slate-900">{nomeStatus(os.status)}</strong>{" "}
              para{" "}
              <strong className="text-slate-900">
                {nomeStatus(statusToConfirm)}
              </strong>
              .
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelarAlteracaoStatus}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => alterarStatus(statusToConfirm)}
                className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
              >
                Confirmar alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <PremiumToast {...toast} onClose={() => setToast(null)} />}

      <SystemModal {...modal} />
    </PageBackground>
  );
}

function PremiumToast({ type, title, message, onClose }: any) {
  const styles: any = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70] w-[calc(100%-3rem)] max-w-sm">
      <div className={`rounded-2xl border p-4 shadow-2xl ring-1 ring-black/5 ${styles[type] || styles.info}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-sm opacity-80">{message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 text-lg leading-none opacity-60 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
        {icon}
      </div>

      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex gap-3 py-2">
      <div className="text-slate-400">{icon}</div>

      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
