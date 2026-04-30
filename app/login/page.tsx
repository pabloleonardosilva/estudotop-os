"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, LogIn } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function fazerLogin(e: any) {
    e.preventDefault();

    setErro("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setLoading(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4">
      <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <div className="bg-[#080b12] px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
            EstudoTOP
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Sistema de OS
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Acesse sua conta para continuar.
          </p>
        </div>

        <form onSubmit={fazerLogin} className="space-y-4 p-8">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Mail size={16} className="text-slate-400" />
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@email.com"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Lock size={16} className="text-slate-400" />
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              required
            />
          </div>

          {erro && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}