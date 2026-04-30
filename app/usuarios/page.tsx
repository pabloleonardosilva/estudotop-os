"use client";

import { useEffect, useState } from "react";
import { Edit3, Plus, Save, Search, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
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

export default function UsuariosPage() {
  const { profile } = useAuth();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator",
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
    carregarUsuarios();
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

  async function carregarUsuarios() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      abrirModal({
        title: "Erro",
        message: "Não foi possível carregar os usuários.",
        type: "error",
      });
      return;
    }

    setUsuarios(data || []);
  }

  function limparFormulario() {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "operator",
    });

    setEditandoId(null);
  }

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function nomeRole(role: string) {
    if (role === "admin") return "Administrador";
    if (role === "operator") return "Operador";
    return role || "-";
  }

  function solicitarSalvarUsuario(e: any) {
    e.preventDefault();

    abrirModal({
      title: editandoId ? "Salvar edição?" : "Cadastrar usuário?",
      message: editandoId
        ? "Tem certeza que deseja salvar as alterações deste usuário?"
        : "Tem certeza que deseja cadastrar este usuário no sistema?",
      type: "warning",
      showCancel: true,
      confirmText: editandoId ? "Sim, salvar" : "Sim, cadastrar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();

        if (editandoId) {
          await salvarEdicaoUsuario();
        } else {
          await cadastrarUsuario();
        }
      },
      onCancel: fecharModal,
    });
  }

  async function cadastrarUsuario() {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const role = form.role;

    if (!name || !email || !password || !role) {
      abrirModal({
        title: "Campos obrigatórios",
        message: "Preencha nome, e-mail, senha e função.",
        type: "warning",
      });
      return;
    }

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      abrirModal({
        title: "Sessão inválida",
        message: "Faça login novamente.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    const response = await fetch("/api/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      abrirModal({
        title: "Erro ao cadastrar",
        message: result.error || "Não foi possível cadastrar o usuário.",
        type: "error",
      });
      return;
    }

    limparFormulario();
    await carregarUsuarios();

    abrirModal({
      title: "Usuário cadastrado",
      message: "O usuário foi cadastrado com sucesso.",
      type: "success",
    });
  }

  async function salvarEdicaoUsuario() {
    if (!editandoId) return;

    const name = form.name.trim();
    const role = form.role;

    if (!name || !role) {
      abrirModal({
        title: "Campos obrigatórios",
        message: "Informe o nome e a função do usuário.",
        type: "warning",
      });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        role,
      })
      .eq("id", editandoId);

    if (error) {
      abrirModal({
        title: "Erro",
        message: "Não foi possível editar o usuário.",
        type: "error",
      });
      return;
    }

    limparFormulario();
    await carregarUsuarios();

    abrirModal({
      title: "Usuário atualizado",
      message: "As alterações foram salvas com sucesso.",
      type: "success",
    });
  }

  function editarUsuario(usuario: any) {
    setEditandoId(usuario.id);

    setForm({
      name: usuario.name || "",
      email: "",
      password: "",
      role: usuario.role || "operator",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const usuariosFiltrados = usuarios.filter((usuario) =>
    `${usuario.name || ""} ${usuario.role || ""}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  if (profile?.role !== "admin") {
    return (
      <PageBackground>
        <PremiumCard
          title="Acesso restrito"
          description="Apenas administradores podem acessar esta área."
          icon={<ShieldCheck size={22} />}
        >
          <p className="text-sm text-slate-500">
            Você não possui permissão para gerenciar usuários.
          </p>
        </PremiumCard>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <PageHeader
        title="Usuários"
        description="Cadastre, consulte e gerencie administradores e operadores do sistema."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={solicitarSalvarUsuario}>
          <PremiumCard
            title={editandoId ? "Editar usuário" : "Novo usuário"}
            description={
              editandoId
                ? "Atualize o nome e a função do usuário."
                : "Cadastre um novo usuário no sistema."
            }
            icon={<UserPlus size={22} />}
          >
            <div className="space-y-4">
              <PremiumInput
                label="Nome"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex.: João Silva"
              />

              {!editandoId && (
                <>
                  <PremiumInput
                    label="E-mail"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                  />

                  <PremiumInput
                    label="Senha provisória"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                  />
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Função
                </span>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="operator">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>

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
                  disabled={loading}
                >
                  {loading
                    ? "Salvando..."
                    : editandoId
                    ? "Salvar edição"
                    : "Cadastrar"}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </form>

        <PremiumCard
          title="Usuários cadastrados"
          description={`${usuariosFiltrados.length} usuário(s) encontrado(s).`}
        >
          <div className="relative mb-5">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou função"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <PremiumTable>
            <PremiumTableHead>
              <tr>
                <PremiumTableHeader>Nome</PremiumTableHeader>
                <PremiumTableHeader>Função</PremiumTableHeader>
                <PremiumTableHeader>Criado em</PremiumTableHeader>
                <PremiumTableHeader align="right">Ações</PremiumTableHeader>
              </tr>
            </PremiumTableHead>

            <PremiumTableBody>
              {usuariosFiltrados.map((usuario) => (
                <PremiumTableRow key={usuario.id}>
                  <PremiumTableCell>
                    <p className="font-medium text-slate-950">
                      {usuario.name || "-"}
                    </p>
                    <p className="text-xs text-slate-400">{usuario.id}</p>
                  </PremiumTableCell>

                  <PremiumTableCell>{nomeRole(usuario.role)}</PremiumTableCell>

                  <PremiumTableCell>
                    {usuario.created_at
                      ? new Date(usuario.created_at).toLocaleString("pt-BR")
                      : "-"}
                  </PremiumTableCell>

                  <PremiumTableCell align="right">
                    <button
                      type="button"
                      onClick={() => editarUsuario(usuario)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                  </PremiumTableCell>
                </PremiumTableRow>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum usuário encontrado.
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