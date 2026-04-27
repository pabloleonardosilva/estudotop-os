"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  Plus,
  Save,
  Timer,
  UserRound,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import SystemModal from "../../components/SystemModal";

export default function NovaOS() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [newTeacherName, setNewTeacherName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const [showNewTeacher, setShowNewTeacher] = useState(false);
  const [showNewSubject, setShowNewSubject] = useState(false);

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
    setForm({ ...form, [e.target.name]: e.target.value });
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
    const selectedTeacher = teachers.find(
      (teacher) => String(teacher.id) === String(selectedTeacherId)
    );

    const selectedSubject = subjects.find(
      (subject) => String(subject.id) === String(selectedSubjectId)
    );

    if (!selectedTeacher) {
      abrirModal({
        title: "Professor obrigatório",
        message: "Selecione um professor.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    if (!selectedSubject) {
      abrirModal({
        title: "Disciplina obrigatória",
        message: "Selecione uma disciplina.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

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

    const { error } = await supabase.from("service_orders").insert([
      {
        os_number: osNumber,
        teacher_id: selectedTeacher.id,
        subject_id: selectedSubject.id,
        professor_name: selectedTeacher.name,
        subject_name: selectedSubject.name,
        file_count: Number(form.file_count),
        drive_link: form.drive_link,
        notes: form.notes,
        total_video_time: form.total_video_time,
        total_video_minutes: tempoParaMinutos(form.total_video_time),
        status: "pendente",
      },
    ]);

    if (error) {
      abrirModal({
        title: "Erro",
        message: "Não foi possível criar a OS.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    abrirModal({
      title: "OS criada",
      message: `OS criada com sucesso: ${osNumber}`,
      type: "success",
      confirmText: "Ver OS",
      onConfirm: () => {
        window.location.href = "/os";
      },
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eff6ff_0,#f8fafc_34%,#eef2f7_100%)] px-4 py-8 md:px-8">
      <section className="mx-auto max-w-5xl">
        <header className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              EstudoTOP OS
            </p>

            <h1 className="mt-3 text-4xl font-medium tracking-tight text-slate-950">
              Nova OS
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Registre um novo envio de vídeos para edição e acompanhamento da
              produção.
            </p>
          </div>

          <a
            href="/os"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Voltar para lista
          </a>
        </header>

        <form
          onSubmit={solicitarCriarOS}
          className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-sm ring-1 ring-slate-200/70"
        >
          <div className="relative border-b border-slate-100 bg-white p-7">
            <div className="absolute right-0 top-0 h-36 w-36 translate-x-12 -translate-y-14 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
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
                }}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
                  color="blue"
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
                }}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
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
                  color="violet"
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
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                required
              />
            </Field>

            <Field label="Tempo total dos vídeos" icon={<Timer size={17} />}>
              <input
                name="total_video_time"
                placeholder="Ex.: 02:35 ou 01:20:30"
                value={form.total_video_time}
                onChange={handleChange}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </Field>

            <div className="lg:col-span-2">
              <Field label="Link do Drive" icon={<LinkIcon size={17} />}>
                <input
                  name="drive_link"
                  placeholder="Cole aqui o link da pasta ou dos arquivos"
                  value={form.drive_link}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
                  className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25"
            >
              <Save size={18} />
              Criar OS
            </button>
          </div>
        </form>
      </section>

      <SystemModal {...modal} />
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
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
  color,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSave: () => void;
  color: "blue" | "violet";
}) {
  const styles =
    color === "blue"
      ? {
          box: "border-blue-200 bg-blue-50/70",
          text: "text-blue-700",
          button: "from-blue-600 to-indigo-600 shadow-blue-500/20",
          focus: "focus:border-blue-400 focus:ring-blue-100",
        }
      : {
          box: "border-violet-200 bg-violet-50/70",
          text: "text-violet-700",
          button: "from-violet-600 to-fuchsia-600 shadow-violet-500/20",
          focus: "focus:border-violet-400 focus:ring-violet-100",
        };

  return (
    <div className={`mt-4 rounded-2xl border p-4 ${styles.box}`}>
      <p className={`mb-3 flex items-center gap-2 text-sm font-medium ${styles.text}`}>
        <Plus size={16} />
        {title}
      </p>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-11 flex-1 rounded-xl border border-white bg-white px-4 text-sm outline-none transition focus:ring-4 ${styles.focus}`}
        />

        <button
          type="button"
          onClick={onSave}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br px-4 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 ${styles.button}`}
        >
          <Check size={16} />
          Salvar
        </button>
      </div>
    </div>
  );
}