"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
  });

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  async function carregarDisciplinas() {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("name");

    if (error) {
      console.error("Erro ao carregar disciplinas:", error);
      alert("Erro ao carregar disciplinas");
      return;
    }

    setDisciplinas(data || []);
  }

  function limparFormulario() {
    setForm({ name: "" });
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

  async function verificarDuplicidade() {
    const nome = normalizarTexto(form.name);

    const { data, error } = await supabase.from("subjects").select("*");

    if (error) {
      console.error("Erro ao verificar duplicidade:", error);
      alert("Erro ao verificar duplicidade");
      return true;
    }

    const duplicada = (data || []).find((disciplina) => {
      if (editandoId && disciplina.id === editandoId) {
        return false;
      }

      return normalizarTexto(disciplina.name || "") === nome;
    });

    if (duplicada) {
      alert(
        `Disciplina já cadastrada (mesmo nome):\n\n${duplicada.name || "-"}`
      );
      return true;
    }

    return false;
  }

  async function salvarDisciplina(e: any) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Informe o nome da disciplina");
      return;
    }

    const temDuplicidade = await verificarDuplicidade();

    if (temDuplicidade) {
      return;
    }

    const dadosDisciplina = {
      name: form.name.trim(),
    };

    if (editandoId) {
      const confirmar = confirm(
        "Tem certeza que deseja salvar as alterações desta disciplina?"
      );

      if (!confirmar) {
        return;
      }

      const { error } = await supabase
        .from("subjects")
        .update(dadosDisciplina)
        .eq("id", editandoId);

      if (error) {
        console.error("Erro ao editar disciplina:", error);
        alert("Erro ao editar disciplina");
        return;
      }

      alert("Disciplina atualizada com sucesso!");
    } else {
      const { error } = await supabase.from("subjects").insert([dadosDisciplina]);

      if (error) {
        console.error("Erro ao cadastrar disciplina:", error);
        alert("Erro ao cadastrar disciplina");
        return;
      }

      alert("Disciplina cadastrada com sucesso!");
    }

    limparFormulario();
    carregarDisciplinas();
  }

  function editarDisciplina(disciplina: any) {
    setEditandoId(disciplina.id);
    setForm({
      name: disciplina.name || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const disciplinasFiltradas = disciplinas.filter((disciplina) => {
    const termo = busca.toLowerCase();
    const nome = `${disciplina.name || ""}`.toLowerCase();

    return nome.includes(termo);
  });

  return (
    <main className="min-h-screen bg-[#e9e9ec] p-4 md:p-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-300 bg-[#f8f8f8] shadow-2xl">
        <header className="border-b border-gray-300 bg-white px-6 py-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">
            EstudoTOP OS
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Disciplinas
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-500">
            Cadastre, consulte e edite disciplinas usadas nas ordens de serviço.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow">
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-white">
                  {editandoId ? "Editar disciplina" : "Cadastrar disciplina"}
                </h2>
              </div>

              <form onSubmit={salvarDisciplina} className="space-y-4 p-5">
                <Campo label="Nome da disciplina">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ex.: Informática"
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
                  Consultar disciplinas
                </h2>
              </div>

              <div className="border-b border-gray-200 bg-gray-50 p-4">
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar por nome da disciplina"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-4 gap-3 border-b border-gray-300 bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700">
                <div className="col-span-2">Disciplina</div>
                <div>ID</div>
                <div>Ações</div>
              </div>

              {disciplinasFiltradas.length === 0 && (
                <div className="p-6 text-center text-sm font-semibold text-slate-500">
                  Nenhuma disciplina encontrada.
                </div>
              )}

              {disciplinasFiltradas.map((disciplina) => (
                <div
                  key={disciplina.id}
                  className="grid grid-cols-4 gap-3 border-b border-gray-100 px-4 py-4 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                >
                  <div className="col-span-2">
                    <p className="font-black text-slate-900">
                      {disciplina.name || "-"}
                    </p>
                  </div>

                  <div className="text-slate-500">#{disciplina.id}</div>

                  <div>
                    <button
                      onClick={() => editarDisciplina(disciplina)}
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