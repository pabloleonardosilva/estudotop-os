import { NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import * as ReactPDF from "@react-pdf/renderer";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import OSDocument from "../../../components/pdf/OSDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const MAX_EMAIL_ATTEMPTS = 3;

const DEFAULT_EMAIL_FROM = "EstudoTOP OS <nova-os@estudotop.com.br>";
const DEFAULT_EMAIL_TO = "edicao@estudotop.com.br";
const DEFAULT_EMAIL_REPLY_TO = "edicao@estudotop.com.br";

type EmailStatus = "pending" | "sending" | "sent" | "error";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return `${error.message}\n\n${error.stack || "Sem stack disponível."}`.slice(0, 4000);
  }

  try {
    return JSON.stringify(error, null, 2).slice(0, 4000);
  } catch {
    return String(error).slice(0, 4000);
  }
}

async function normalizeToBuffer(value: any): Promise<Buffer> {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);

  if (value && typeof value[Symbol.asyncIterator] === "function") {
    const chunks: Buffer[] = [];

    for await (const chunk of value) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  return Buffer.from(value);
}

async function saveSystemLog({
  level,
  source,
  message,
  serviceOrderId,
  metadata,
}: {
  level: "info" | "warning" | "error";
  source: string;
  message: string;
  serviceOrderId?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    const { error } = await supabaseAdmin.from("system_logs").insert([
      {
        level,
        source,
        message,
        service_order_id: serviceOrderId || null,
        metadata: metadata || {},
      },
    ]);

    if (error) {
      console.error("[system_logs] Falha ao gravar log:", error);
    }
  } catch (error) {
    console.error("[system_logs] Erro inesperado ao gravar log:", error);
  }
}

async function updateEmailStatus({
  osId,
  status,
  error,
  sentAt,
  retryCount,
  lastAttemptAt,
}: {
  osId: string;
  status: EmailStatus;
  error?: string | null;
  sentAt?: string | null;
  retryCount?: number;
  lastAttemptAt?: string | null;
}) {
  const payload: any = {
    email_status: status,
    email_error: error ?? null,
  };

  if (sentAt !== undefined) payload.email_sent_at = sentAt;
  if (retryCount !== undefined) payload.email_retry_count = retryCount;
  if (lastAttemptAt !== undefined) payload.email_last_attempt_at = lastAttemptAt;

  const { error: updateError } = await supabaseAdmin
    .from("service_orders")
    .update(payload)
    .eq("id", osId);

  if (!updateError) return;

  console.error("[send-email] Erro ao atualizar status do e-mail:", {
    osId,
    status,
    updateError,
  });

  await saveSystemLog({
    level: "error",
    source: "api/os/send-email:updateEmailStatus",
    message: "Erro ao atualizar status do e-mail na OS.",
    serviceOrderId: osId,
    metadata: { status, updateError },
  });

  const fallbackPayload: any = {
    email_status: status,
    email_error: error ?? null,
  };

  if (sentAt !== undefined) fallbackPayload.email_sent_at = sentAt;

  const { error: fallbackError } = await supabaseAdmin
    .from("service_orders")
    .update(fallbackPayload)
    .eq("id", osId);

  if (fallbackError) {
    console.error("[send-email] Fallback também falhou:", fallbackError);
  }
}

async function carregarOS(osId: string) {
  const { data, error } = await supabaseAdmin
    .from("service_orders")
    .select(
      `
      *,
      teachers:teacher_id (name),
      subjects:subject_id (name)
    `
    )
    .eq("id", osId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Não foi possível carregar a OS para envio de e-mail.");
  }

  return data;
}

async function gerarPdfDaOS(osCompleta: any) {
  const pdfInstance = ReactPDF.pdf(
    React.createElement(OSDocument, { os: osCompleta })
  );

  const pdfOutput = await pdfInstance.toBuffer();
  return normalizeToBuffer(pdfOutput);
}

async function enviarEmailComPdf(osCompleta: any, pdfBuffer: Buffer) {
  const osNumber = osCompleta.os_number || "OS";
  const professor = osCompleta.teachers?.name || osCompleta.professor_name || "-";
  const disciplina = osCompleta.subjects?.name || osCompleta.subject_name || "-";
  const arquivos = osCompleta.file_count ?? "-";
  const tempo = osCompleta.total_video_time || "-";
  const link = osCompleta.drive_link || "-";
  const observacoes = osCompleta.notes || "-";
  const operador = osCompleta.operator_name || "-";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const osLink = `${appUrl}/os/${osCompleta.id}`;

  const emailTo = process.env.OS_NOTIFICATION_EMAIL || DEFAULT_EMAIL_TO;
  const emailFrom = process.env.RESEND_FROM_EMAIL || DEFAULT_EMAIL_FROM;
  const emailReplyTo = process.env.RESEND_REPLY_TO_EMAIL || DEFAULT_EMAIL_REPLY_TO;

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: [emailTo],
    replyTo: emailReplyTo,
    subject: `Nova OS criada - ${osNumber}`,
    html: `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
          <div style="background:#080b12;border-radius:22px;padding:26px;margin-bottom:18px;">
            <p style="margin:0 0 8px;color:#fb923c;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">EstudoTOP OS</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.2;">Nova Ordem de Serviço</h1>
            <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;">Uma nova OS foi registrada no sistema.</p>
          </div>

          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:22px;padding:24px;">
            <div style="display:inline-block;background:#ffedd5;color:#9a3412;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:bold;margin-bottom:18px;">${escapeHtml(osNumber)}</div>

            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:10px 0;color:#64748b;width:170px;">Professor</td><td style="padding:10px 0;font-weight:bold;color:#0f172a;">${escapeHtml(professor)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b;">Disciplina</td><td style="padding:10px 0;font-weight:bold;color:#0f172a;">${escapeHtml(disciplina)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b;">Quantidade de arquivos</td><td style="padding:10px 0;font-weight:bold;color:#0f172a;">${escapeHtml(arquivos)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b;">Tempo total</td><td style="padding:10px 0;font-weight:bold;color:#0f172a;">${escapeHtml(tempo)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b;">Operador</td><td style="padding:10px 0;font-weight:bold;color:#0f172a;">${escapeHtml(operador)}</td></tr>
            </table>

            <div style="height:1px;background:#e5e7eb;margin:20px 0;"></div>

            <p style="margin:0 0 6px;color:#64748b;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Link do Drive</p>
            <p style="margin:0 0 18px;color:#0f172a;font-size:14px;word-break:break-word;">${escapeHtml(link)}</p>

            <p style="margin:0 0 6px;color:#64748b;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Observações</p>
            <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.6;">${escapeHtml(observacoes)}</p>

            <div style="margin-top:26px;">
              <a href="${osLink}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;border-radius:14px;padding:13px 18px;font-size:14px;font-weight:bold;">Abrir OS no sistema</a>
            </div>
          </div>

          <p style="margin:16px 4px 0;color:#94a3b8;font-size:12px;">O PDF da OS está anexado a este e-mail.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `OS-${osNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(error.message || "Erro desconhecido retornado pelo Resend.");
  }
}

export async function POST(req: Request) {
  let osId: string | null = null;

  try {
    const body = await req.json();
    osId = body?.osId ? String(body.osId) : null;
    const force = body?.force === true;

    if (!osId) {
      return NextResponse.json(
        { success: false, error: "ID da OS não informado." },
        { status: 400 }
      );
    }

    const osCompleta = await carregarOS(osId);
    const retryCountAtual = Number(osCompleta.email_retry_count || 0);

    if (!force && retryCountAtual >= MAX_EMAIL_ATTEMPTS && osCompleta.email_status === "error") {
      return NextResponse.json(
        {
          success: false,
          error: `Limite de ${MAX_EMAIL_ATTEMPTS} tentativas atingido. Use reenvio manual para forçar nova tentativa.`,
        },
        { status: 429 }
      );
    }

    const tentativaInicial = force ? 0 : retryCountAtual;
    let lastError: unknown = null;

    for (let tentativa = tentativaInicial + 1; tentativa <= MAX_EMAIL_ATTEMPTS; tentativa++) {
      const now = new Date().toISOString();

      await updateEmailStatus({
        osId,
        status: "sending",
        error: null,
        sentAt: null,
        retryCount: tentativa,
        lastAttemptAt: now,
      });

      await saveSystemLog({
        level: "info",
        source: "api/os/send-email",
        message: `Tentativa ${tentativa}/${MAX_EMAIL_ATTEMPTS} de envio de e-mail da OS.`,
        serviceOrderId: osId,
        metadata: { osNumber: osCompleta.os_number, tentativa, force },
      });

      try {
        const pdfBuffer = await gerarPdfDaOS(osCompleta);
        await enviarEmailComPdf(osCompleta, pdfBuffer);

        await updateEmailStatus({
          osId,
          status: "sent",
          error: null,
          sentAt: new Date().toISOString(),
          retryCount: tentativa,
          lastAttemptAt: now,
        });

        await saveSystemLog({
          level: "info",
          source: "api/os/send-email",
          message: "E-mail da OS enviado com sucesso.",
          serviceOrderId: osId,
          metadata: { osNumber: osCompleta.os_number, tentativa },
        });

        return NextResponse.json({ success: true, attempts: tentativa });
      } catch (attemptError) {
        lastError = attemptError;
        const detail = buildErrorDetail(attemptError);

        console.error("[send-email] Falha na tentativa de envio:", {
          osId,
          tentativa,
          detail,
        });

        await saveSystemLog({
          level: "error",
          source: "api/os/send-email",
          message: `Falha na tentativa ${tentativa}/${MAX_EMAIL_ATTEMPTS} de envio de e-mail da OS.`,
          serviceOrderId: osId,
          metadata: { osNumber: osCompleta.os_number, tentativa, detail },
        });

        if (tentativa < MAX_EMAIL_ATTEMPTS) {
          await sleep(1200);
          continue;
        }
      }
    }

    const detail = buildErrorDetail(lastError);

    await updateEmailStatus({
      osId,
      status: "error",
      error: detail,
      retryCount: MAX_EMAIL_ATTEMPTS,
      lastAttemptAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: false, error: "Não foi possível enviar o e-mail após as tentativas automáticas." },
      { status: 500 }
    );
  } catch (err) {
    const detail = buildErrorDetail(err);

    console.error("[send-email] Erro inesperado:", { osId, detail });

    if (osId) {
      await updateEmailStatus({
        osId,
        status: "error",
        error: detail,
        lastAttemptAt: new Date().toISOString(),
      });

      await saveSystemLog({
        level: "error",
        source: "api/os/send-email:unexpected",
        message: "Erro inesperado no envio de e-mail da OS.",
        serviceOrderId: osId,
        metadata: { detail },
      });
    }

    return NextResponse.json(
      { success: false, error: "Erro inesperado ao enviar e-mail." },
      { status: 500 }
    );
  }
}
