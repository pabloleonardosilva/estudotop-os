"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  Loader2,
  Plus,
  Save,
  Timer,
  UserRound,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import SystemModal from "../../components/SystemModal";

export default function NovaOS() {
  const { user, profile } = useAuth();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [newTeacherName, setNewTeacherName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const [showNewTeacher, setShowNewTeacher] = useState(false);
  const [showNewSubject, setShowNewSubject] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const [form, setForm] = useState({
    file_count: "",
    drive_link: "",
    notes: "",
    total_video_time: "",
  });

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
    carregarDados();
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

  async function carregarDados() {
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
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (fieldErrors.includes(name)) {
      setFieldErrors((current) => current.filter((field) => field !== name));
    }
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

  function isAdmin() {
    return profile?.role === "admin";
  }

  function getInputClass(fieldName: string) {
    if (!fieldErrors.includes(fieldName)) return inputClass;

    return `${inputClass} border-red-300 bg-red-50/60 text-red-900 focus:border-red-400 focus:ring-red-100`;
  }

  function getTextAreaClass(fieldName: string) {
    const baseClass =
      "min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

    if (!fieldErrors.includes(fieldName)) return baseClass;

    return `${baseClass} border-red-300 bg-red-50/60 text-red-900 focus:border-red-400 focus:ring-red-100`;
  }

  function validarCamposObrigatorios() {
    if (isAdmin()) {
      setFieldErrors([]);
      return true;
    }

    const erros: string[] = [];

    if (!selectedTeacherId) erros.push("teacher_id");
    if (!selectedSubjectId) erros.push("subject_id");
    if (!form.drive_link.trim()) erros.push("drive_link");
    if (!form.file_count || Number(form.file_count) <= 0) erros.push("file_count");
    if (!form.total_video_time.trim()) erros.push("total_video_time");

    setFieldErrors(erros);

    if (erros.length === 0) return true;

    const labels: Record<string, string> = {
      teacher_id: "professor",
      subject_id: "disciplina",
      drive_link: "link do Drive",
      file_count: "quantidade de arquivos",
      total_video_time: "tempo total",
    };

    const lista = erros.map((erro) => labels[erro]).join(", ");

    abrirModal({
      title: "Campos obrigatórios pendentes",
      message: `Para criar a OS, informe: ${lista}. Os campos pendentes foram destacados no formulário.`,
      type: "warning",
      confirmText: "Vou corrigir",
    });

    return false;
  }

  async function criarProfessor() {
    const name = newTeacherName.trim();

    if (!name) {
      abrirModal({
        title: "Nome obrigatório",
        message: "Digite o nome do professor.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    const { data, error } = await supabase
      .from("teachers")
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      abrirModal({
        title: "Erro",
        message: "Não foi possível cadastrar o professor.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    await carregarDados();

    setSelectedTeacherId(String(data.id));
    setNewTeacherName("");
    setShowNewTeacher(false);

    abrirModal({
      title: "Professor cadastrado",
      message: `Professor "${data.name}" cadastrado com sucesso.`,
      type: "success",
      confirmText: "OK",
    });
  }

  async function criarDisciplina() {
    const name = newSubjectName.trim();

    if (!name) {
      abrirModal({
        title: "Nome obrigatório",
        message: "Digite o nome da disciplina.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    const { data, error } = await supabase
      .from("subjects")
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      abrirModal({
        title: "Erro",
        message: "Não foi possível cadastrar a disciplina.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    await carregarDados();

    setSelectedSubjectId(String(data.id));
    setNewSubjectName("");
    setShowNewSubject(false);

    abrirModal({
      title: "Disciplina cadastrada",
      message: `Disciplina "${data.name}" cadastrada com sucesso.`,
      type: "success",
      confirmText: "OK",
    });
  }

  function solicitarCriarOS(e: any) {
    e.preventDefault();

    if (!validarCamposObrigatorios()) return;

    abrirModal({
      title: "Criar nova OS?",
      message: "Tem certeza que deseja criar esta ordem de serviço?",
      type: "warning",
      showCancel: true,
      confirmText: "Sim, criar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();
        await criarOS();
      },
      onCancel: fecharModal,
    });
  }

  async function criarOS() {
    if (!user) {
      abrirModal({
        title: "Usuário não identificado",
        message: "Faça login novamente para criar uma OS.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    const selectedTeacher = teachers.find(
      (teacher) => String(teacher.id) === String(selectedTeacherId)
    );

    const selectedSubject = subjects.find(
      (subject) => String(subject.id) === String(selectedSubjectId)
    );

    if (!isAdmin() && !selectedTeacher) {
      abrirModal({
        title: "Professor obrigatório",
        message: "Selecione um professor.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    if (!isAdmin() && !selectedSubject) {
      abrirModal({
        title: "Disciplina obrigatória",
        message: "Selecione uma disciplina.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    setIsCreating(true);

    const { data: ultimaOS } = await supabase
      .from("service_orders")
      .select("os_number")
      .order("created_at", { ascending: false })
      .limit(1);

    let novoNumero = 1;

    if (ultimaOS && ultimaOS.length > 0 && ultimaOS[0].os_number) {
      const numeroAtual = ultimaOS[0].os_number.split("-")[1];
      novoNumero = Number(numeroAtual) + 1;
    }

    const osNumber = `OAB-${String(novoNumero).padStart(4, "0")}`;
    const userName = getUserName();
    const fileCount = form.file_count ? Number(form.file_count) : 0;
    const totalVideoTime = form.total_video_time.trim();
    const driveLink = form.drive_link.trim();

    const { data: createdOS, error } = await supabase
      .from("service_orders")
      .insert([
        {
          os_number: osNumber,
          teacher_id: selectedTeacher?.id || null,
          subject_id: selectedSubject?.id || null,
          professor_name: selectedTeacher?.name || "Não informado",
          subject_name: selectedSubject?.name || "Não informado",
          file_count: fileCount,
          drive_link: driveLink,
          notes: form.notes,
          total_video_time: totalVideoTime,
          total_video_minutes: tempoParaMinutos(totalVideoTime),
          status: "pendente",
          email_status: "pending",
          operator_id: user.id,
          operator_name: userName,
        },
      ])
      .select("id, os_number")
      .single();

    if (error) {
      setIsCreating(false);

      abrirModal({
        title: "Erro",
        message: error.message || "Não foi possível criar a OS.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    await supabase.from("service_order_history").insert([
      {
        service_order_id: createdOS.id,
        user_id: user.id,
        user_name: userName,
        action: "created",
        description: `OS ${osNumber} criada por ${userName}.`,
      },
    ]);

    enviarEmailDaOS(createdOS.id);

    setIsCreating(false);

    abrirModal({
      title: "OS criada",
      message: `OS criada com sucesso: ${osNumber}. O envio do e-mail foi iniciado em segundo plano.`,
      type: "success",
      confirmText: "Ver OS",
      onConfirm: () => {
        window.location.href = `/os/${createdOS.id}`;
      },
    });
  }

  async function enviarEmailDaOS(osId: string) {
    try {
      const emailResponse = await fetch("/api/os/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ osId }),
      });

      let emailResult: any = null;

      try {
        emailResult = await emailResponse.json();
      } catch {
        emailResult = null;
      }

      if (!emailResponse.ok) {
        console.error("Erro ao enviar e-mail da OS:", emailResult);
      }
    } catch (err) {
      console.error("Erro inesperado no envio de e-mail da OS:", err);
    }
  }

  return (
    <main className="min-h-screen bg-[#e9e9ec] px-4 py-7 md:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-r from-white via-white to-orange-50 p-8 shadow-sm ring-1 ring-slate-200/60">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-14 -translate-y-16 rounded-full bg-orange-500/10 blur-2xl" />
          <div className="absolute bottom-0 right-32 h-32 w-32 translate-y-16 rounded-full bg-amber-400/10 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-500">
                EstudoTOP OS
              </p>

              <h1 className="mt-3 text-4xl font-medium tracking-tight text-slate-950">
                Nova OS
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Registre um novo envio de vídeos para edição e acompanhamento
                da produção.
              </p>
            </div>

            <a
              href="/os"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
            >
              <ArrowLeft size={17} />
              Voltar para lista
            </a>
          </div>
        </header>

        <form
          onSubmit={solicitarCriarOS}
          className="mt-7 overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-sm ring-1 ring-slate-200/60 backdrop-blur"
        >
          <div className="relative border-b border-slate-100 bg-gradient-to-r from-white via-white to-orange-50/70 p-7">
            <div className="absolute right-0 top-0 h-36 w-36 translate-x-12 -translate-y-14 rounded-full bg-orange-500/10 blur-2xl" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                <ClipboardList size={25} />
              </div>

              <div>
                <h2 className="text-xl font-medium tracking-tight text-slate-950">
                  Dados da ordem de serviço
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preencha os campos abaixo para criar uma nova OS.
                </p>
              </div>
            </div>
          </div>

          {fieldErrors.length > 0 && !isAdmin() && (
            <div className="mx-7 mt-7 rounded-[1.5rem] border border-red-200 bg-gradient-to-r from-red-50 via-white to-orange-50 p-5 shadow-sm ring-1 ring-red-100/70">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-950">
                    Antes de criar a OS, complete os campos obrigatórios.
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Professor, disciplina, link do Drive, quantidade de arquivos e tempo total são obrigatórios para operadores. Os campos pendentes estão destacados abaixo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAdmin() && (
            <div className="mx-7 mt-7 rounded-[1.5rem] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-sm ring-1 ring-amber-100/70">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-950">
                    Modo administrador ativo
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Administradores podem criar OS mesmo com campos incompletos. Para operadores, os campos essenciais continuam obrigatórios.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 p-7 lg:grid-cols-2">
            <Field label="Professor" icon={<UserRound size={17} />}>
              <select
                value={selectedTeacherId}
                onChange={(e) => {
                  if (e.target.value === "new") {
                    setShowNewTeacher(true);
                    setSelectedTeacherId("");
                    return;
                  }

                  setSelectedTeacherId(e.target.value);
                  setShowNewTeacher(false);
                  setFieldErrors((current) => current.filter((field) => field !== "teacher_id"));
                }}
                className={getInputClass("teacher_id")}
              >
                <option value="">Selecione um professor</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
                <option value="new">Cadastrar novo professor</option>
              </select>

              {showNewTeacher && (
                <InlineCreate
                  title="Cadastrar novo professor"
                  value={newTeacherName}
                  onChange={setNewTeacherName}
                  placeholder="Nome do novo professor"
                  onSave={criarProfessor}
                />
              )}
            </Field>

            <Field label="Disciplina" icon={<BookOpen size={17} />}>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  if (e.target.value === "new") {
                    setShowNewSubject(true);
                    setSelectedSubjectId("");
                    return;
                  }

                  setSelectedSubjectId(e.target.value);
                  setShowNewSubject(false);
                  setFieldErrors((current) => current.filter((field) => field !== "subject_id"));
                }}
                className={getInputClass("subject_id")}
              >
                <option value="">Selecione uma disciplina</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
                <option value="new">Cadastrar nova disciplina</option>
              </select>

              {showNewSubject && (
                <InlineCreate
                  title="Cadastrar nova disciplina"
                  value={newSubjectName}
                  onChange={setNewSubjectName}
                  placeholder="Nome da nova disciplina"
                  onSave={criarDisciplina}
                />
              )}
            </Field>

            <Field label="Quantidade de arquivos" icon={<FolderOpen size={17} />}>
              <input
                name="file_count"
                type="number"
                placeholder="Ex.: 12"
                value={form.file_count}
                onChange={handleChange}
                className={getInputClass("file_count")}
              />
            </Field>

            <Field label="Tempo total dos vídeos" icon={<Timer size={17} />}>
              <input
                name="total_video_time"
                placeholder="Ex.: 02:35 ou 01:20:30"
                value={form.total_video_time}
                onChange={handleChange}
                className={getInputClass("total_video_time")}
              />
            </Field>

            <div className="lg:col-span-2">
              <Field label="Link do Drive" icon={<LinkIcon size={17} />}>
                <input
                  name="drive_link"
                  placeholder="Cole aqui o link da pasta ou dos arquivos"
                  value={form.drive_link}
                  onChange={handleChange}
                  className={getInputClass("drive_link")}
                />
              </Field>
            </div>

            <div className="lg:col-span-2">
              <Field label="Observações" icon={<FileText size={17} />}>
                <textarea
                  name="notes"
                  placeholder="Inclua orientações importantes para a edição."
                  value={form.notes}
                  onChange={handleChange}
                  className={getTextAreaClass("notes")}
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-7 md:flex-row md:items-center md:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              A OS será criada com status inicial{" "}
              <span className="font-medium text-slate-700">Pendente</span>.
            </p>

            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isCreating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Criando OS...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Criar OS
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {isCreating && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/70 bg-white p-7 text-center shadow-2xl ring-1 ring-slate-200/60">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
              <Loader2 size={28} className="animate-spin" />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
              Criando OS...
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Estamos registrando a ordem de serviço e iniciando o envio do e-mail.
            </p>
          </div>
        </div>
      )}

      <SystemModal {...modal} />
    </main>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>

      {children}
    </div>
  );
}

function InlineCreate({
  title,
  value,
  onChange,
  placeholder,
  onSave,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSave: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-orange-700">
        <Plus size={16} />
        {title}
      </p>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-xl border border-white bg-white px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />

        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
        >
          <Check size={16} />
          Salvar
        </button>
      </div>
    </div>
  );
}