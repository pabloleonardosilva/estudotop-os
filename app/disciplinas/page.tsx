"use client";

import { useEffect, useState } from "react";
import { BookOpen, Edit3, Plus, Save, Search, Trash2 } from "lucide-react";
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

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "" });

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
    carregarDisciplinas();
  }, []);

  function normalizarNome(valor: string) {
    return valor
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
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

  async function carregarDisciplinas() {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("name");

    if (error) {
      abrirModal({
        title: "Erro",
        message: "Não foi possível carregar as disciplinas.",
        type: "error",
      });
      return;
    }

    setDisciplinas(data || []);
  }

  function limparFormulario() {
    setForm({ name: "" });
    setEditandoId(null);
  }

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function tratarErroDuplicidade(error: any) {
    if (error?.code === "23505") {
      abrirModal({
        title: "Disciplina duplicada",
        message:
          "Já existe uma disciplina com esse nome. O banco bloqueou o cadastro duplicado.",
        type: "warning",
      });
      return true;
    }

    return false;
  }

  function solicitarSalvarDisciplina(e: any) {
    e.preventDefault();

    abrirModal({
      title: editandoId ? "Salvar edição?" : "Cadastrar disciplina?",
      message: editandoId
        ? "Tem certeza que deseja salvar as alterações desta disciplina?"
        : "Tem certeza que deseja cadastrar esta disciplina?",
      type: "warning",
      showCancel: true,
      confirmText: editandoId ? "Sim, salvar" : "Sim, cadastrar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();
        await salvarDisciplina();
      },
      onCancel: fecharModal,
    });
  }

  async function salvarDisciplina() {
    const name = form.name.trim().replace(/\s+/g, " ").toUpperCase();

    if (!name) {
      abrirModal({
        title: "Nome obrigatório",
        message: "Informe o nome da disciplina.",
        type: "warning",
      });
      return;
    }

    const payload = {
      name,
      normalized_name: normalizarNome(name),
    };

    if (editandoId) {
      const { error } = await supabase
        .from("subjects")
        .update(payload)
        .eq("id", editandoId);

      if (error) {
        if (tratarErroDuplicidade(error)) return;

        abrirModal({
          title: "Erro",
          message: "Não foi possível editar a disciplina.",
          type: "error",
        });
        return;
      }

      abrirModal({
        title: "Disciplina atualizada",
        message: "As alterações foram salvas com sucesso.",
        type: "success",
      });
    } else {
      const { error } = await supabase.from("subjects").insert([payload]);

      if (error) {
        if (tratarErroDuplicidade(error)) return;

        abrirModal({
          title: "Erro",
          message: "Não foi possível cadastrar a disciplina.",
          type: "error",
        });
        return;
      }

      abrirModal({
        title: "Disciplina cadastrada",
        message: "A disciplina foi cadastrada com sucesso.",
        type: "success",
      });
    }

    limparFormulario();
    await carregarDisciplinas();
  }

  function editarDisciplina(disciplina: any) {
    setEditandoId(disciplina.id);
    setForm({ name: disciplina.name || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function solicitarExcluirDisciplina(disciplina: any) {
    abrirModal({
      title: "Excluir disciplina?",
      message: `Tem certeza que deseja excluir "${disciplina.name}"? Essa ação não poderá ser desfeita.`,
      type: "warning",
      showCancel: true,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();
        await excluirDisciplina(disciplina);
      },
      onCancel: fecharModal,
    });
  }

  async function excluirDisciplina(disciplina: any) {
    const { data: osVinculadas, error: erroConsulta } = await supabase
      .from("service_orders")
      .select("id")
      .eq("subject_id", disciplina.id)
      .limit(1);

    if (erroConsulta) {
      abrirModal({
        title: "Erro ao verificar vínculos",
        message:
          "Não foi possível verificar se esta disciplina possui OS vinculadas.",
        type: "error",
      });
      return;
    }

    if (osVinculadas && osVinculadas.length > 0) {
      abrirModal({
        title: "Exclusão bloqueada",
        message:
          "Não é possível excluir esta disciplina porque ela já está vinculada a uma ou mais OS.",
        type: "warning",
      });
      return;
    }

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", disciplina.id);

    if (error) {
      abrirModal({
        title: "Erro ao excluir",
        message: "Não foi possível excluir esta disciplina.",
        type: "error",
      });
      return;
    }

    await carregarDisciplinas();

    abrirModal({
      title: "Disciplina excluída",
      message: "A disciplina foi excluída com sucesso.",
      type: "success",
    });
  }

  const disciplinasFiltradas = disciplinas.filter((disciplina) =>
    `${disciplina.name || ""}`.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <PageBackground>
      <PageHeader
        title="Disciplinas"
        description="Cadastre, consulte, edite e gerencie disciplinas usadas nas ordens de serviço."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={solicitarSalvarDisciplina}>
          <PremiumCard
            title={editandoId ? "Editar disciplina" : "Nova disciplina"}
            description={
              editandoId
                ? "Atualize o nome da disciplina selecionada."
                : "Cadastre uma nova disciplina no sistema."
            }
            icon={<BookOpen size={22} />}
          >
            <div className="space-y-4">
              <PremiumInput
                label="Nome da disciplina"
                name="name"
                value={form.name}
                uppercase
                onChange={handleChange}
                placeholder="Ex.: INFORMÁTICA"
              />

              <div className="flex gap-3">
                {editandoId && (
                  <PremiumButton
                    type="button"
                    variant="secondary"
                    full
                    onClick={limparFormulario}
                  >
                    Cancelar
                  </PremiumButton>
                )}

                <PremiumButton
                  type="submit"
                  full
                  icon={editandoId ? <Save size={18} /> : <Plus size={18} />}
                >
                  {editandoId ? "Salvar edição" : "Cadastrar"}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </form>

        <PremiumCard
          title="Disciplinas cadastradas"
          description={`${disciplinasFiltradas.length} disciplina(s) encontrada(s).`}
        >
          <div className="relative mb-5">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome da disciplina"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <PremiumTable>
            <PremiumTableHead>
              <tr>
                <PremiumTableHeader>Disciplina</PremiumTableHeader>
                <PremiumTableHeader>ID</PremiumTableHeader>
                <PremiumTableHeader align="right">Ações</PremiumTableHeader>
              </tr>
            </PremiumTableHead>

            <PremiumTableBody>
              {disciplinasFiltradas.map((disciplina) => (
                <PremiumTableRow key={disciplina.id}>
                  <PremiumTableCell>
                    <p className="font-medium text-slate-950">
                      {disciplina.name || "-"}
                    </p>
                  </PremiumTableCell>

                  <PremiumTableCell>#{disciplina.id}</PremiumTableCell>

                  <PremiumTableCell align="right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => editarDisciplina(disciplina)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Edit3 size={14} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => solicitarExcluirDisciplina(disciplina)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        title="Excluir disciplina"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </PremiumTableCell>
                </PremiumTableRow>
              ))}

              {disciplinasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhuma disciplina encontrada.
                  </td>
                </tr>
              )}
            </PremiumTableBody>
          </PremiumTable>
        </PremiumCard>
      </div>

      <SystemModal {...modal} />
    </PageBackground>
  );
}