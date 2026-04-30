"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { supabase } from "../../../../lib/supabase";
import OSDocument from "../../../components/pdf/OSDocument";

export default function GerarPDF() {
  const { id } = useParams();
  const [os, setOs] = useState<any>(null);

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    const { data, error } = await supabase
      .from("service_orders")
      .select(`
        *,
        teachers:teacher_id (name),
        subjects:subject_id (name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao carregar OS:", error);
      return;
    }

    setOs(data);
  }

  if (!os) {
    return (
      <main className="min-h-screen bg-slate-100 p-10 text-sm text-slate-500">
        Carregando PDF...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-10">
      <PDFDownloadLink
        document={<OSDocument os={os} />}
        fileName={`OS-${os.os_number}.pdf`}
        className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20"
      >
        Baixar PDF da OS
      </PDFDownloadLink>
    </main>
  );
}