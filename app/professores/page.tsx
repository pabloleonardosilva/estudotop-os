"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import SystemModal from "../components/SystemModal";
import PageBackground from "../components/ui/PageBackground";
import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumInput from "../components/ui/PremiumInput";
import {
  PremiumTable,
  PremiumTableBody,
  PremiumTableCell,
  PremiumTableHead,
  PremiumTableHeader,
  PremiumTableRow,
} from "../components/ui/PremiumTable";

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    whatsapp: "",
  });

  const [editando, setEditando] = useState<any>(null);

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
    carregarProfessores();
  }, []);

  function normalizarNome(valor: string) {
    return valor
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function normalizarEmail(valor: string) {
    return valor.trim().toLowerCase();
  }

  function normalizarWhatsapp(valor: string) {
    return valor.replace(/\D/g, "");
  }

  async function carregarProfessores() {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("name");

    if (error) {
      abrirModal({
        title: "Erro",
        message: "Não foi possível carregar os professores.",
        type: "error",
      });
      return;
    }

    setProfessores(data || []);
  }

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

  function nomeCompleto() {
    return `${form.nome.trim()} ${form.sobrenome.trim()}`.trim().replace(/\s+/g, " ");
  }

  function limparFormulario() {
    setForm({
      nome: "",
      sobrenome: "",
      email: "",
      whatsapp: "",
    });
  }

  function tratarErroDuplicidade(error: any) {
    if (error?.code === "23505") {
      abrirModal({
        title: "Cadastro duplicado",
        message:
          "Já existe um professor com o mesmo nome, e-mail ou WhatsApp. O banco bloqueou o cadastro duplicado.",
        type: "warning",
      });
      return true;
    }

    return false;
  }

  async function cadastrarProfessor(e: any) {
    e.preventDefault();

    const name = nomeCompleto().toUpperCase();

    if (!name) {
      abrirModal({
        title: "Nome obrigatório",
        message: "Informe pelo menos o nome do professor.",
        type: "warning",
      });
      return;
    }

    const payload = {
      name,
      email: form.email.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      normalized_name: normalizarNome(name),
      normalized_email: form.email.trim() ? normalizarEmail(form.email) : null,
      normalized_whatsapp: form.whatsapp.trim()
        ? normalizarWhatsapp(form.whatsapp)
        : null,
    };

    const { error } = await supabase.from("teachers").insert([payload]);

    if (error) {
      if (tratarErroDuplicidade(error)) return;

      abrirModal({
        title: "Erro ao cadastrar",
        message: "Não foi possível cadastrar o professor.",
        type: "error",
      });
      return;
    }

    limparFormulario();
    await carregarProfessores();

    abrirModal({
      title: "Professor cadastrado",
      message: "O professor foi cadastrado com sucesso.",
      type: "success",
    });
  }

  function iniciarEdicao(professor: any) {
    setEditando({
      id: professor.id,
      name: professor.name || "",
      email: professor.email || "",
      whatsapp: professor.whatsapp || "",
    });
  }

  async function salvarEdicao() {
    if (!editando?.name?.trim()) {
      abrirModal({
        title: "Nome obrigatório",
        message: "O nome do professor não pode ficar vazio.",
        type: "warning",
      });
      return;
    }

    const name = editando.name.trim().replace(/\s+/g, " ").toUpperCase();

    const payload = {
      name,
      email: editando.email.trim() || null,
      whatsapp: editando.whatsapp.trim() || null,
      normalized_name: normalizarNome(name),
      normalized_email: editando.email.trim()
        ? normalizarEmail(editando.email)
        : null,
      normalized_whatsapp: editando.whatsapp.trim()
        ? normalizarWhatsapp(editando.whatsapp)
        : null,
    };

    const { error } = await supabase
      .from("teachers")
      .update(payload)
      .eq("id", editando.id);

    if (error) {
      if (tratarErroDuplicidade(error)) return;

      abrirModal({
        title: "Erro ao salvar",
        message: "Não foi possível atualizar o professor.",
        type: "error",
      });
      return;
    }

    setEditando(null);
    await carregarProfessores();

    abrirModal({
      title: "Professor atualizado",
      message: "Os dados foram salvos com sucesso.",
      type: "success",
    });
  }

  function solicitarExcluirProfessor(professor: any) {
    abrirModal({
      title: "Excluir professor?",
      message: `Tem certeza que deseja excluir "${professor.name}"? Essa ação não poderá ser desfeita.`,
      type: "warning",
      showCancel: true,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();
        await excluirProfessor(professor);
      },
      onCancel: fecharModal,
    });
  }

  async function excluirProfessor(professor: any) {
    const { data: osVinculadas, error: erroConsulta } = await supabase
      .from("service_orders")
      .select("id")
      .eq("teacher_id", professor.id)
      .limit(1);

    if (erroConsulta) {
      abrirModal({
        title: "Erro ao verificar vínculos",
        message:
          "Não foi possível verificar se este professor possui OS vinculadas.",
        type: "error",
      });
      return;
    }

    if (osVinculadas && osVinculadas.length > 0) {
      abrirModal({
        title: "Exclusão bloqueada",
        message:
          "Não é possível excluir este professor porque ele já está vinculado a uma ou mais OS.",
        type: "warning",
      });
      return;
    }

    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", professor.id);

    if (error) {
      abrirModal({
        title: "Erro ao excluir",
        message: "Não foi possível excluir este professor.",
        type: "error",
      });
      return;
    }

    await carregarProfessores();

    abrirModal({
      title: "Professor excluído",
      message: "O professor foi excluído com sucesso.",
      type: "success",
    });
  }

  const professoresFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return professores;

    return professores.filter((professor) => {
      return (
        String(professor.name || "").toLowerCase().includes(termo) ||
        String(professor.email || "").toLowerCase().includes(termo) ||
        String(professor.whatsapp || "").toLowerCase().includes(termo)
      );
    });
  }, [busca, professores]);

  return (
    <PageBackground>
      <PageHeader
        title="Professores"
        description="Cadastre, consulte, edite e gerencie os professores usados nas ordens de serviço."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={cadastrarProfessor}>
          <PremiumCard
            title="Novo professor"
            description="Cadastre um professor no sistema."
            icon={<GraduationCap size={22} />}
          >
            <div className="space-y-4">
              <PremiumInput
                label="Nome"
                icon={<UserRound size={16} />}
                placeholder="Ex.: PABLO"
                value={form.nome}
                uppercase
                onChange={(e: any) =>
                  setForm({ ...form, nome: e.target.value })
                }
              />

              <PremiumInput
                label="Sobrenome"
                icon={<UserRound size={16} />}
                placeholder="Ex.: LEONARDO"
                value={form.sobrenome}
                uppercase
                onChange={(e: any) =>
                  setForm({ ...form, sobrenome: e.target.value })
                }
              />

              <PremiumInput
                label="E-mail"
                icon={<Mail size={16} />}
                placeholder="professor@email.com"
                value={form.email}
                onChange={(e: any) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <PremiumInput
                label="WhatsApp"
                icon={<Phone size={16} />}
                placeholder="(31) 99999-9999"
                value={form.whatsapp}
                onChange={(e: any) =>
                  setForm({ ...form, whatsapp: e.target.value })
                }
              />

              <PremiumButton type="submit" full icon={<Plus size={18} />}>
                Cadastrar professor
              </PremiumButton>
            </div>
          </PremiumCard>
        </form>

        <PremiumCard
          title="Professores cadastrados"
          description={`${professoresFiltrados.length} professor(es) encontrado(s).`}
        >
          <div className="relative mb-5">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, e-mail ou WhatsApp"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <PremiumTable>
            <PremiumTableHead>
              <tr>
                <PremiumTableHeader>Professor</PremiumTableHeader>
                <PremiumTableHeader>E-mail</PremiumTableHeader>
                <PremiumTableHeader>WhatsApp</PremiumTableHeader>
                <PremiumTableHeader align="right">Ações</PremiumTableHeader>
              </tr>
            </PremiumTableHead>

            <PremiumTableBody>
              {professoresFiltrados.map((professor) => (
                <PremiumTableRow key={professor.id}>
                  <PremiumTableCell>
                    <div>
                      <p className="font-medium text-slate-950">
                        {professor.name || "-"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        ID #{professor.id}
                      </p>
                    </div>
                  </PremiumTableCell>

                  <PremiumTableCell>{professor.email || "-"}</PremiumTableCell>

                  <PremiumTableCell>
                    {professor.whatsapp || "-"}
                  </PremiumTableCell>

                  <PremiumTableCell align="right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(professor)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Edit3 size={14} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => solicitarExcluirProfessor(professor)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        title="Excluir professor"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </PremiumTableCell>
                </PremiumTableRow>
              ))}

              {professoresFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum professor encontrado.
                  </td>
                </tr>
              )}
            </PremiumTableBody>
          </PremiumTable>
        </PremiumCard>
      </div>

      {editando && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-medium text-slate-950">
                  Editar professor
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Atualize os dados do professor selecionado.
                </p>
              </div>

              <button
                onClick={() => setEditando(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <PremiumInput
                label="Nome completo"
                icon={<UserRound size={16} />}
                value={editando.name}
                uppercase
                onChange={(e: any) =>
                  setEditando({ ...editando, name: e.target.value })
                }
              />

              <PremiumInput
                label="E-mail"
                icon={<Mail size={16} />}
                value={editando.email}
                onChange={(e: any) =>
                  setEditando({ ...editando, email: e.target.value })
                }
              />

              <PremiumInput
                label="WhatsApp"
                icon={<Phone size={16} />}
                value={editando.whatsapp}
                onChange={(e: any) =>
                  setEditando({ ...editando, whatsapp: e.target.value })
                }
              />

              <PremiumButton
                full
                icon={<Save size={18} />}
                onClick={salvarEdicao}
              >
                Salvar alterações
              </PremiumButton>
            </div>
          </div>
        </div>
      )}

      <SystemModal {...modal} />
    </PageBackground>
  );
}