"use client";

/**
 * ARQUIVO: Impressão da OS
 * OBJETIVO: versão A4 para imprimir pelo navegador.
 * ONDE MEXER: layout A4, campos exibidos, rodapé e assinaturas.
 * CUIDADO: classes print/no-print controlam impressão.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function PrintOS() {
  const { id } = useParams();
  const [os, setOs] = useState<any>(null);

  useEffect(() => {
    carregarOS();
  }, []);

  // Busca os dados da OS atual no Supabase.
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

  if (!os) {
    return (
      <main className="min-h-screen bg-white p-10 text-sm text-slate-500">
        Carregando OS...
      </main>
    );
  }

  return (
    <main className="print-container min-h-screen bg-[#f5f6f8] text-slate-900">
      <div className="no-print flex justify-end p-6">
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          Imprimir
        </button>
      </div>

      <section className="mx-auto mb-10 w-[210mm] min-h-[297mm] bg-white px-12 py-10 shadow-sm print:mb-0 print:shadow-none">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <img
              src="/logo-estudotop.webp"
              alt="EstudoTOP"
              className="h-9 w-auto"
            />
            <p className="mt-2 text-xs font-normal text-slate-500">
              Ordem de Serviço de Produção Audiovisual
            </p>
          </div>

          <div className="text-right">
            <p className="text-xl font-medium tracking-tight text-slate-950">
              {os.os_number}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Emitida em {formatarData(new Date().toISOString())}
            </p>
          </div>
        </header>

        <section className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Status atual
            </p>
            <p className="mt-1 text-base font-medium text-slate-900">
              {nomeStatus(os.status)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Data de envio
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatarData(os.created_at)}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Dados principais
          </h2>

          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <PrintInfo label="Professor" value={os.professor_name} />
            <PrintInfo label="Disciplina" value={os.subject_name} />
            <PrintInfo label="Quantidade de arquivos" value={os.file_count} />
            <PrintInfo label="Tempo total" value={os.total_video_time} />
            <PrintInfo
              label="Tempo em minutos"
              value={os.total_video_minutes}
            />
            <PrintInfo
              label="Data de conclusão"
              value={os.completed_at ? formatarData(os.completed_at) : "-"}
            />
          </div>
        </section>

        <section className="mt-9">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Link do Google Drive
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
            <p className="break-all">{os.drive_link || "Não informado"}</p>
          </div>
        </section>

        <section className="mt-9">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Observações
          </h2>

          <div className="min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
            {os.notes || "Nenhuma observação registrada."}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-2 gap-12">
          <div>
            <div className="border-t border-slate-300 pt-3 text-xs text-slate-500">
              Responsável pela edição
            </div>
          </div>

          <div>
            <div className="border-t border-slate-300 pt-3 text-xs text-slate-500">
              Conferência / Aprovação
            </div>
          </div>
        </section>

        <footer className="mt-14 flex justify-between border-t border-slate-200 pt-4 text-xs text-slate-400">
          <span>Sistema EstudoTOP OS</span>
          <span>{formatarData(new Date().toISOString())}</span>
        </footer>
      </section>
    </main>
  );
}

function PrintInfo({ label, value }: { label: string; value: any }) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <p className="text-xs font-normal uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}