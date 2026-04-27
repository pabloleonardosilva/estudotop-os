"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Files,
  Link as LinkIcon,
  Printer,
  UserRound,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function DetalheOS() {
  const { id } = useParams();
  const [os, setOs] = useState<any>(null);

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao carregar OS:", error);
      return;
    }

    setOs(data);
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

  if (!os) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] px-6 py-6">
        <p className="text-sm font-medium text-slate-500">Carregando OS...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-6 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              EstudoTOP OS
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {os.os_number}
              </h1>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estiloStatus(
                  os.status
                )}`}
              >
                {nomeStatus(os.status)}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Detalhamento completo da ordem de serviço.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/os"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Voltar
            </a>

            <a
              href={`/os/${os.id}/editar`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Edit3 size={18} />
              Editar
            </a>

            <a
              href={`/os/${os.id}/print`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Printer size={18} />
              Imprimir
            </a>
          </div>
        </header>

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

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Professor e disciplina">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem
                icon={<UserRound size={18} />}
                label="Professor"
                value={os.professor_name || "-"}
              />

              <DetailItem
                icon={<BookOpen size={18} />}
                label="Disciplina"
                value={os.subject_name || "-"}
              />
            </div>
          </Panel>

          <Panel title="Dados da produção">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem
                icon={<Files size={18} />}
                label="Quantidade de arquivos"
                value={os.file_count || 0}
              />

              <DetailItem
                icon={<Clock size={18} />}
                label="Tempo em minutos"
                value={os.total_video_minutes || 0}
              />
            </div>
          </Panel>
        </section>

        <section className="grid grid-cols-1 gap-6">
          <Panel title="Link do Google Drive">
            {os.drive_link ? (
              <a
                href={os.drive_link}
                target="_blank"
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                <LinkIcon size={18} className="mt-0.5 shrink-0" />
                <span className="break-all">{os.drive_link}</span>
                <ExternalLink size={16} className="ml-auto shrink-0" />
              </a>
            ) : (
              <EmptyText text="Nenhum link informado." />
            )}
          </Panel>

          <Panel title="Observações">
            <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <FileText size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="min-h-20 text-sm leading-relaxed text-slate-600">
                {os.notes || "Nenhuma observação registrada."}
              </p>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>

      {children}
    </section>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mt-0.5 text-slate-400">{icon}</div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {text}
    </p>
  );
}