"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  FileVideo,
  Film,
  FolderOpen,
  Mail,
  Plus,
  Trophy,
} from "lucide-react";
import PageBackground from "../components/ui/PageBackground";
import PageHeader from "../components/ui/PageHeader";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumLoadingOverlay from "../components/ui/PremiumLoadingOverlay";

export default function Dashboard() {
  const [dados, setDados] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    buscarDados();
    buscarFiltros();
  }, [mes, ano, filtroProfessor, filtroDisciplina]);

  async function buscarDados() {
    setLoading(true);

    const inicio = new Date(ano, mes - 1, 1, 0, 0, 0, 0).toISOString();
    const fim = new Date(ano, mes, 0, 23, 59, 59, 999).toISOString();

    let query = supabase
      .from("service_orders")
      .select("*")
      .gte("created_at", inicio)
      .lte("created_at", fim)
      .order("created_at", { ascending: false });

    if (filtroProfessor) query = query.eq("teacher_id", filtroProfessor);
    if (filtroDisciplina) query = query.eq("subject_id", filtroDisciplina);

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      setDados([]);
      setLoading(false);
      return;
    }

    setDados(data || []);
    setLoading(false);
  }

  async function buscarFiltros() {
    const { data: teachersData } = await supabase.from("teachers").select("*").order("name");
    const { data: subjectsData } = await supabase.from("subjects").select("*").order("name");

    setTeachers(teachersData || []);
    setSubjects(subjectsData || []);
  }

  function minutosParaHoras(minutos: number) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${String(m).padStart(2, "0")}min`;
  }

  const totalOS = dados.length;
  const totalArquivos = dados.reduce((total, os) => total + Number(os.file_count || 0), 0);
  const pendentes = dados.filter((os) => os.status === "pendente");
  const editando = dados.filter((os) => os.status === "editando");
  const concluidos = dados.filter((os) => os.status === "concluido");
  const emailsEnviados = dados.filter((os) => os.email_status === "sent");
  const emailsErro = dados.filter((os) => os.email_status === "error");
  const emailsEnviando = dados.filter((os) => os.email_status === "sending");
  const emailsPendentes = dados.filter((os) => !os.email_status || os.email_status === "pending");

  const totalMinutosRecebidos = dados.reduce((total, os) => total + Number(os.total_video_minutes || 0), 0);
  const totalMinutosConcluidos = concluidos.reduce((total, os) => total + Number(os.total_video_minutes || 0), 0);

  const percentualConcluido = totalMinutosRecebidos > 0 ? Math.round((totalMinutosConcluidos / totalMinutosRecebidos) * 100) : 0;
  const percentualEmailsSucesso = totalOS > 0 ? Math.round((emailsEnviados.length / totalOS) * 100) : 0;
  const percentualEmailsErro = totalOS > 0 ? Math.round((emailsErro.length / totalOS) * 100) : 0;
  const percentualEmailsEnviando = totalOS > 0 ? Math.round((emailsEnviando.length / totalOS) * 100) : 0;
  const percentualEmailsPendentes = totalOS > 0 ? Math.round((emailsPendentes.length / totalOS) * 100) : 0;

  const rankingProfessores = teachers
    .map((teacher) => {
      const osDoProfessor = dados.filter((os) => String(os.teacher_id) === String(teacher.id));
      const minutos = osDoProfessor.reduce((total, os) => total + Number(os.total_video_minutes || 0), 0);
      return { name: teacher.name, totalOS: osDoProfessor.length, minutos };
    })
    .filter((item) => item.totalOS > 0)
    .sort((a, b) => b.minutos - a.minutos)
    .slice(0, 6);

  return (
    <PageBackground>
      <PremiumLoadingOverlay show={loading} title="Carregando dashboard..." message="Atualizando indicadores de produção." />

      <PageHeader title="Dashboard" description="Acompanhe a produção mensal, status das ordens de serviço e indicadores operacionais." />

      <section className="mb-5 grid grid-cols-1 gap-3 rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur md:grid-cols-6">
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100">
          {[
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
          ].map((nome, index) => <option key={nome} value={index + 1}>{nome}</option>)}
        </select>

        <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />

        <select value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 md:col-span-2">
          <option value="">Todos os professores</option>
          {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
        </select>

        <select value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 md:col-span-2">
          <option value="">Todas as disciplinas</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total de OS" value={totalOS} icon={<FolderOpen size={20} />} />
        <MetricCard title="Arquivos enviados" value={totalArquivos} icon={<FileVideo size={20} />} />
        <MetricCard title="Horas recebidas" value={minutosParaHoras(totalMinutosRecebidos)} icon={<Clock3 size={20} />} />
        <MetricCard title="Horas concluídas" value={minutosParaHoras(totalMinutosConcluidos)} icon={<Film size={20} />} />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Painel titulo="Produtividade do mês" icon={<CalendarDays size={18} />}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-500">Percentual de horas concluídas em relação às recebidas.</p>
              <p className="mt-4 text-5xl font-medium tracking-tight text-slate-950">{percentualConcluido}%</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{concluidos.length} concluídas</div>
          </div>
          <Progress value={percentualConcluido} className="bg-emerald-600" />
          <div className="mt-6 divide-y divide-slate-100">
            <LinhaResumo label="Total de OS" valor={totalOS} />
            <LinhaResumo label="Arquivos enviados" valor={totalArquivos} />
            <LinhaResumo label="Horas recebidas" valor={minutosParaHoras(totalMinutosRecebidos)} />
            <LinhaResumo label="Horas concluídas" valor={minutosParaHoras(totalMinutosConcluidos)} />
          </div>
        </Painel>

        <Painel titulo="OS por status" icon={<BarChart3 size={18} />}>
          <StatusLine label="Pendente" value={pendentes.length} total={totalOS} color="bg-amber-500" />
          <StatusLine label="Em edição" value={editando.length} total={totalOS} color="bg-slate-600" />
          <StatusLine label="Concluído" value={concluidos.length} total={totalOS} color="bg-emerald-600" />
        </Painel>

        <Painel titulo="Carga por professor" icon={<Trophy size={18} />} className="lg:col-span-2">
          {rankingProfessores.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Nenhum dado encontrado para os filtros selecionados.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {rankingProfessores.map((professor) => {
                const largura = totalMinutosRecebidos > 0 ? Math.max(6, Math.round((professor.minutos / totalMinutosRecebidos) * 100)) : 0;
                return (
                  <div key={professor.name} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{professor.name}</span>
                      <span className="font-semibold text-slate-900">{minutosParaHoras(professor.minutos)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-slate-700" style={{ width: `${largura}%` }} /></div>
                    <p className="mt-2 text-xs text-slate-400">{professor.totalOS} OS no período</p>
                  </div>
                );
              })}
            </div>
          )}
        </Painel>
      </section>

      <EmailHealthStrip
        enviados={emailsEnviados.length}
        erros={emailsErro.length}
        enviando={emailsEnviando.length}
        pendentes={emailsPendentes.length}
        sucesso={percentualEmailsSucesso}
        erro={percentualEmailsErro}
        enviandoPercent={percentualEmailsEnviando}
        pendentesPercent={percentualEmailsPendentes}
      />

      <footer className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-slate-500">Painel operacional baseado nas OS registradas no Supabase.</p>
        <div className="flex gap-3">
          <Link href="/os"><PremiumButton variant="secondary">Ver OS</PremiumButton></Link>
          <Link href="/os/nova"><PremiumButton icon={<Plus size={16} />}>Nova OS</PremiumButton></Link>
        </div>
      </footer>
    </PageBackground>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: any; icon: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-10 blur-xl" />
      <div className="relative flex items-start justify-between">
        <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{title}</p><p className="mt-3 text-2xl font-medium tracking-tight text-slate-950">{value}</p></div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20">{icon}</div>
      </div>
    </div>
  );
}

function EmailHealthStrip({ enviados, erros, enviando, pendentes, sucesso, erro, enviandoPercent, pendentesPercent }: any) {
  const total = enviados + erros + enviando + pendentes;
  const taxaSucesso = total > 0 ? Math.round((enviados / total) * 100) : 0;
  const segmentos = [
    { key: "sent", label: "Enviados", value: enviados, percent: sucesso, className: "bg-emerald-500" },
    { key: "error", label: "Com erro", value: erros, percent: erro, className: "bg-rose-500" },
    { key: "sending", label: "Enviando", value: enviando, percent: enviandoPercent, className: "bg-sky-500" },
    { key: "pending", label: "Pendentes", value: pendentes, percent: pendentesPercent, className: "bg-amber-500" },
  ];

  return (
    <section className="mt-5 rounded-[1.7rem] border border-slate-200/70 bg-white/85 p-5 shadow-sm ring-1 ring-white/80 backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
            <Mail size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Saúde dos e-mails</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Visão discreta dos envios automáticos. Falhas ficam destacadas na própria OS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
          {segmentos.map((item) => (
            <div key={item.key} className="min-w-[110px]">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${item.className}`} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight text-slate-950">{item.value}</span>
                <span className="text-xs font-medium text-slate-400">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Taxa de sucesso dos envios</span>
          <span className="font-semibold text-slate-800">{taxaSucesso}%</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
          {segmentos.map((item) => {
            const largura = total > 0 ? Math.max(item.value > 0 ? 3 : 0, Math.round((item.value / total) * 100)) : 0;
            return <div key={item.key} className={`${item.className} h-full`} style={{ width: `${largura}%` }} />;
          })}
        </div>
      </div>
    </section>
  );
}


function Painel({ titulo, icon, children, className = "" }: { titulo: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.6rem] border border-white/80 bg-white p-5 shadow-sm ring-1 ring-slate-200/60 ${className}`}>
      <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">{icon}</div><h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">{titulo}</h2></div>
      {children}
    </div>
  );
}

function LinhaResumo({ label, valor }: { label: string; valor: any }) {
  return <div className="flex items-center justify-between py-2"><span className="text-sm text-slate-500">{label}</span><span className="text-sm font-semibold text-slate-900">{valor}</span></div>;
}

function Progress({ value, className }: { value: number; className: string }) {
  return <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${className}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

function StatusLine({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const largura = total > 0 ? Math.max(value > 0 ? 6 : 0, Math.round((value / total) * 100)) : 0;

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500"><span>{label}</span><span className="font-medium text-slate-900">{value}</span></div>
      <div className="h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${largura}%` }} /></div>
    </div>
  );
}
