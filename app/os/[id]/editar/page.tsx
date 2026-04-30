"use client";

/**
 * ARQUIVO: Edição de OS
 * OBJETIVO: permite alterar dados de uma OS existente.
 * ONDE MEXER: carregamento da OS, campos editáveis e função de salvar.
 * CUIDADO: preserve rastreabilidade como os_number, created_by, operator_name e created_at.
 */

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Files,
  Link as LinkIcon,
  Save,
  UserRound,
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import SystemModal from "../../../components/SystemModal";

export default function EditarOS() {
  const { id } = useParams();
  const { user, profile } = useAuth();

  const [os, setOs] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [alterado, setAlterado] = useState(false);

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

  const ignorarAvisoSaida = useRef(false);

  useEffect(() => {
    carregarOS();
    carregarFiltros();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      if (alterado && !ignorarAvisoSaida.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [alterado]);

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

  // Busca os dados da OS atual no Supabase.
  async function carregarOS() {
    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      abrirModal({
        title: "Erro ao carregar OS",
        message: "Não foi possível carregar os dados desta ordem de serviço.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    setOs(data);
    setForm(data);
    setAlterado(false);
  }

  async function carregarFiltros() {
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

  function handleChange(e: any) {
    setAlterado(true);

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function tempoParaMinutos(tempo: string) {
    if (!tempo) return 0;

    const partes = tempo.split(":").map(Number);

    if (partes.length === 3) {
      const [h, m, s] = partes;
      return h * 60 + m + Math.round(s / 60);
    }

    if (partes.length === 2) {
      const [h, m] = partes;
      return h * 60 + m;
    }

    return 0;
  }

  function getUserName() {
    return profile?.name || user?.email || "Usuário";
  }

  function formatValue(value: any) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  }

  function criarDescricaoHistorico(updateData: any) {
    if (!os) return "OS atualizada.";

    const alteracoes: string[] = [];

    const campos = [
      {
        label: "Professor",
        oldValue: os.professor_name,
        newValue: updateData.professor_name,
      },
      {
        label: "Disciplina",
        oldValue: os.subject_name,
        newValue: updateData.subject_name,
      },
      {
        label: "Quantidade de arquivos",
        oldValue: os.file_count,
        newValue: updateData.file_count,
      },
      {
        label: "Tempo total dos vídeos",
        oldValue: os.total_video_time,
        newValue: updateData.total_video_time,
      },
      {
        label: "Link do Drive",
        oldValue: os.drive_link,
        newValue: updateData.drive_link,
      },
      {
        label: "Observações",
        oldValue: os.notes,
        newValue: updateData.notes,
      },
    ];

    campos.forEach((campo) => {
      if (formatValue(campo.oldValue) !== formatValue(campo.newValue)) {
        alteracoes.push(
          `${campo.label}: "${formatValue(campo.oldValue)}" → "${formatValue(
            campo.newValue
          )}"`
        );
      }
    });

    if (alteracoes.length === 0) {
      return `OS ${os.os_number} salva por ${getUserName()}, sem alterações relevantes.`;
    }

    return `OS ${os.os_number} atualizada por ${getUserName()}. Alterações: ${alteracoes.join(
      "; "
    )}.`;
  }

  function solicitarSalvar(e: any) {
    e.preventDefault();

    abrirModal({
      title: "Salvar alterações?",
      message: "Tem certeza que deseja salvar as alterações feitas nesta OS?",
      type: "warning",
      showCancel: true,
      confirmText: "Sim, salvar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();
        await salvar();
      },
      onCancel: fecharModal,
    });
  }

  async function salvar() {
    if (!user) {
      abrirModal({
        title: "Usuário não identificado",
        message: "Faça login novamente para salvar esta OS.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    const selectedTeacher = teachers.find(
      (teacher) => String(teacher.id) === String(form.teacher_id)
    );

    const selectedSubject = subjects.find(
      (subject) => String(subject.id) === String(form.subject_id)
    );

    if (!selectedTeacher) {
      abrirModal({
        title: "Professor obrigatório",
        message: "Selecione um professor antes de salvar a OS.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    if (!selectedSubject) {
      abrirModal({
        title: "Disciplina obrigatória",
        message: "Selecione uma disciplina antes de salvar a OS.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    const updateData: any = {
      teacher_id: form.teacher_id,
      subject_id: form.subject_id,
      professor_name: selectedTeacher.name,
      subject_name: selectedSubject.name,
      file_count: Number(form.file_count),
      drive_link: form.drive_link,
      notes: form.notes,
      total_video_time: form.total_video_time,
      total_video_minutes: tempoParaMinutos(form.total_video_time),
    };

    const description = criarDescricaoHistorico(updateData);

    const { error } = await supabase
      .from("service_orders")
      .update(updateData)
      .eq("id", id);

    if (error) {
      abrirModal({
        title: "Erro ao salvar",
        message: "Não foi possível salvar as alterações desta OS.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    await supabase.from("service_order_history").insert([
      {
        service_order_id: Number(id),
        user_id: user.id,
        user_name: getUserName(),
        action: "updated",
        description,
      },
    ]);

    ignorarAvisoSaida.current = true;
    setAlterado(false);

    abrirModal({
      title: "OS atualizada",
      message: "As alterações foram salvas com sucesso.",
      type: "success",
      confirmText: "Ver detalhes",
      onConfirm: () => {
        window.location.href = `/os/${id}`;
      },
    });
  }

  function cancelarEdicao() {
    if (alterado) {
      abrirModal({
        title: "Sair sem salvar?",
        message:
          "Você tem alterações não salvas. Deseja sair mesmo assim?\n\nAs alterações feitas nesta tela serão perdidas.",
        type: "warning",
        showCancel: true,
        confirmText: "Sim, sair",
        cancelText: "Continuar editando",
        onConfirm: () => {
          ignorarAvisoSaida.current = true;
          window.location.href = `/os/${id}`;
        },
        onCancel: fecharModal,
      });

      return;
    }

    ignorarAvisoSaida.current = true;
    window.location.href = `/os/${id}`;
  }

  if (!os) {
    return (
      <main className="min-h-screen bg-[#f5f6f8] px-6 py-6">
        <p className="text-sm font-medium text-slate-500">Carregando OS...</p>
        <SystemModal {...modal} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-6 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              EstudoTOP OS
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Editar {os.os_number}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Atualize os dados da ordem de serviço.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cancelarEdicao}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>

            <button
              type="submit"
              form="form-editar-os"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              <Save size={18} />
              Salvar alterações
            </button>
          </div>
        </header>

        {alterado && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
            Existem alterações não salvas nesta OS.
          </div>
        )}

        <form id="form-editar-os" onSubmit={solicitarSalvar} className="space-y-6">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Professor e disciplina">
              <div className="grid grid-cols-1 gap-4">
                <Campo label="Professor" icon={<UserRound size={18} />}>
                  <select
                    name="teacher_id"
                    value={form.teacher_id || ""}
                    onChange={handleChange}
                    className="input-clean"
                  >
                    <option value="">Selecione um professor</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo label="Disciplina" icon={<BookOpen size={18} />}>
                  <select
                    name="subject_id"
                    value={form.subject_id || ""}
                    onChange={handleChange}
                    className="input-clean"
                  >
                    <option value="">Selecione uma disciplina</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
            </Panel>

            <Panel title="Dados dos vídeos">
              <div className="grid grid-cols-1 gap-4">
                <Campo label="Quantidade de arquivos" icon={<Files size={18} />}>
                  <input
                    name="file_count"
                    type="number"
                    value={form.file_count || ""}
                    onChange={handleChange}
                    className="input-clean"
                  />
                </Campo>

                <Campo label="Tempo total dos vídeos" icon={<Clock size={18} />}>
                  <input
                    name="total_video_time"
                    value={form.total_video_time || ""}
                    onChange={handleChange}
                    placeholder="Ex.: 01:30 ou 01:30:00"
                    className="input-clean"
                  />
                </Campo>
              </div>
            </Panel>
          </section>

          <Panel title="Link e observações">
            <div className="grid grid-cols-1 gap-4">
              <Campo label="Link do Google Drive" icon={<LinkIcon size={18} />}>
                <input
                  name="drive_link"
                  value={form.drive_link || ""}
                  onChange={handleChange}
                  className="input-clean"
                  placeholder="Cole aqui o link do Google Drive"
                />
              </Campo>

              <Campo label="Observações" icon={<FileText size={18} />}>
                <textarea
                  name="notes"
                  value={form.notes || ""}
                  onChange={handleChange}
                  className="input-clean min-h-32 resize-y"
                  placeholder="Digite observações importantes sobre esta OS"
                />
              </Campo>
            </div>
          </Panel>

          <Panel title="Status da OS">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <CheckCircle2 size={18} />
                Status atual
              </div>

              <p className="text-sm font-semibold text-slate-700">
                O status agora deve ser alterado somente na tela de detalhes da
                OS, por um administrador.
              </p>
            </div>
          </Panel>
        </form>
      </div>

      <SystemModal {...modal} />

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
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.18);
        }
      `}</style>
    </main>
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

function Campo({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      {children}
    </label>
  );
}