"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SystemModal from "../components/SystemModal";

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    whatsapp: "",
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
    carregarProfessores();
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

  async function carregarProfessores() {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      abrirModal({
        title: "Erro",
        message: "Não foi possível carregar os professores.",
        type: "error",
        confirmText: "Entendi",
      });
      return;
    }

    setProfessores(data || []);
  }

  function limparFormulario() {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      whatsapp: "",
    });

    setEditandoId(null);
  }

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function normalizarTexto(texto: string) {
    return texto.trim().toLowerCase();
  }

  function normalizarWhatsApp(valor: string) {
    return valor.replace(/\D/g, "");
  }

  function extrairPrimeiroNome(nomeCompleto: string) {
    if (!nomeCompleto) return "";
    return nomeCompleto.split(" ")[0] || "";
  }

  function extrairSobrenome(nomeCompleto: string) {
    if (!nomeCompleto) return "";
    const partes = nomeCompleto.split(" ");
    partes.shift();
    return partes.join(" ");
  }

  async function verificarDuplicidade() {
    const nomeCompleto = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();
    const email = normalizarTexto(form.email);
    const whatsapp = normalizarWhatsApp(form.whatsapp);

    const { data, error } = await supabase.from("teachers").select("*");

    if (error) {
      console.error(error);
      abrirModal({
        title: "Erro",
        message: "Não foi possível verificar duplicidade.",
        type: "error",
        confirmText: "Entendi",
      });
      return true;
    }

    const duplicado = (data || []).find((professor) => {
      if (editandoId && professor.id === editandoId) return false;

      const nomeBanco = normalizarTexto(professor.name || "");
      const emailBanco = normalizarTexto(professor.email || "");
      const whatsappBanco = normalizarWhatsApp(professor.whatsapp || "");

      const motivos = [];

      if (nomeCompleto && nomeBanco === normalizarTexto(nomeCompleto)) {
        motivos.push("mesmo nome");
      }

      if (email && emailBanco === email) {
        motivos.push("mesmo e-mail");
      }

      if (whatsapp && whatsappBanco === whatsapp) {
        motivos.push("mesmo WhatsApp");
      }

      if (motivos.length > 0) {
        professor._motivosDuplicidade = motivos;
        return true;
      }

      return false;
    });

    if (duplicado) {
      const motivosTexto = duplicado._motivosDuplicidade.join(", ");

      abrirModal({
        title: "Professor já cadastrado",
        message: `Encontramos um professor com ${motivosTexto}:\n\n${duplicado.name || "-"}\n${duplicado.email || "-"}\n${duplicado.whatsapp || "-"}`,
        type: "warning",
        confirmText: "Entendi",
      });

      return true;
    }

    return false;
  }

  function solicitarSalvarProfessor(e: any) {
    e.preventDefault();

    abrirModal({
      title: editandoId ? "Salvar edição?" : "Cadastrar professor?",
      message: editandoId
        ? "Tem certeza que deseja salvar as alterações deste professor?"
        : "Tem certeza que deseja cadastrar este professor?",
      type: "warning",
      showCancel: true,
      confirmText: editandoId ? "Sim, salvar" : "Sim, cadastrar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        fecharModal();
        await salvarProfessor();
      },
      onCancel: fecharModal,
    });
  }

  async function salvarProfessor() {
    if (!form.first_name.trim()) {
      abrirModal({
        title: "Nome obrigatório",
        message: "Informe o nome do professor.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    if (!form.last_name.trim()) {
      abrirModal({
        title: "Sobrenome obrigatório",
        message: "Informe o sobrenome do professor.",
        type: "warning",
        confirmText: "Entendi",
      });
      return;
    }

    const nomeCompleto = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();

    const temDuplicidade = await verificarDuplicidade();
    if (temDuplicidade) return;

    const dadosProfessor = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim(),
      name: nomeCompleto,
    };

    if (editandoId) {
      const { error } = await supabase
        .from("teachers")
        .update(dadosProfessor)
        .eq("id", editandoId);

      if (error) {
        console.error(error);
        abrirModal({
          title: "Erro",
          message: "Não foi possível editar o professor.",
          type: "error",
          confirmText: "Entendi",
        });
        return;
      }

      abrirModal({
        title: "Professor atualizado",
        message: "As alterações foram salvas com sucesso.",
        type: "success",
        confirmText: "OK",
      });
    } else {
      const { error } = await supabase.from("teachers").insert([dadosProfessor]);

      if (error) {
        console.error(error);
        abrirModal({
          title: "Erro",
          message: "Não foi possível cadastrar o professor.",
          type: "error",
          confirmText: "Entendi",
        });
        return;
      }

      abrirModal({
        title: "Professor cadastrado",
        message: "O professor foi cadastrado com sucesso.",
        type: "success",
        confirmText: "OK",
      });
    }

    limparFormulario();
    carregarProfessores();
  }

  function editarProfessor(professor: any) {
    setEditandoId(professor.id);

    setForm({
      first_name: professor.first_name || extrairPrimeiroNome(professor.name),
      last_name: professor.last_name || extrairSobrenome(professor.name),
      email: professor.email || "",
      whatsapp: professor.whatsapp || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const professoresFiltrados = professores.filter((professor) => {
    const termo = busca.toLowerCase();

    const nome = `${professor.name || ""}`.toLowerCase();
    const email = `${professor.email || ""}`.toLowerCase();
    const whatsapp = `${professor.whatsapp || ""}`.toLowerCase();

    return (
      nome.includes(termo) ||
      email.includes(termo) ||
      whatsapp.includes(termo)
    );
  });

  return (
    <main className="min-h-screen bg-[#e9e9ec] p-4 md:p-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-300 bg-[#f8f8f8] shadow-2xl">
        <header className="border-b border-gray-300 bg-white px-6 py-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">
            EstudoTOP OS
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Professores
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-500">
            Cadastre, consulte e edite professores usados nas ordens de serviço.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow">
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-white">
                  {editandoId ? "Editar professor" : "Cadastrar professor"}
                </h2>
              </div>

              <form onSubmit={solicitarSalvarProfessor} className="space-y-4 p-5">
                <Campo label="Nome">
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Ex.: Pablo"
                    className="input"
                  />
                </Campo>

                <Campo label="Sobrenome">
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Ex.: Leonardo"
                    className="input"
                  />
                </Campo>

                <Campo label="E-mail">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="professor@email.com"
                    className="input"
                  />
                </Campo>

                <Campo label="WhatsApp">
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="(31) 99999-9999"
                    className="input"
                  />
                </Campo>

                <div className="flex gap-3 pt-3">
                  {editandoId && (
                    <button
                      type="button"
                      onClick={limparFormulario}
                      className="w-1/2 rounded bg-gray-200 px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    className={`rounded bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 ${
                      editandoId ? "w-1/2" : "w-full"
                    }`}
                  >
                    {editandoId ? "Salvar edição" : "Cadastrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow">
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-white">
                  Consultar professores
                </h2>
              </div>

              <div className="border-b border-gray-200 bg-gray-50 p-4">
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar por nome, e-mail ou WhatsApp"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-5 gap-3 border-b border-gray-300 bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700">
                <div className="col-span-2">Professor</div>
                <div>E-mail</div>
                <div>WhatsApp</div>
                <div>Ações</div>
              </div>

              {professoresFiltrados.length === 0 && (
                <div className="p-6 text-center text-sm font-semibold text-slate-500">
                  Nenhum professor encontrado.
                </div>
              )}

              {professoresFiltrados.map((professor) => (
                <div
                  key={professor.id}
                  className="grid grid-cols-5 gap-3 border-b border-gray-100 px-4 py-4 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                >
                  <div className="col-span-2">
                    <p className="font-black text-slate-900">
                      {professor.name || "-"}
                    </p>
                    <p className="text-xs text-slate-400">ID #{professor.id}</p>
                  </div>

                  <div className="truncate" title={professor.email}>
                    {professor.email || "-"}
                  </div>

                  <div>{professor.whatsapp || "-"}</div>

                  <div>
                    <button
                      onClick={() => editarProfessor(professor)}
                      className="rounded bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <SystemModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          background: white;
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          outline: none;
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
      `}</style>
    </main>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}