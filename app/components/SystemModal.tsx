"use client";

/**
 * ARQUIVO: Modal global
 * OBJETIVO: avisos, confirmações e erros com visual premium.
 * ONDE MEXER: visual por tipo e textos padrão.
 * CUIDADO: usado por várias páginas.
 */

export default function SystemModal({
  open,
  title,
  message,
  type = "info",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = false,
  onConfirm,
  onCancel,
}: any) {
  if (!open) return null;

  const styles: any = {
    info: {
      icon: "i",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    success: {
      icon: "✓",
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    },
    warning: {
      icon: "!",
      color: "bg-gradient-to-r from-amber-400 to-orange-500",
    },
    error: {
      icon: "×",
      color: "bg-gradient-to-r from-red-500 to-red-600",
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className={`${current.color} px-6 py-5 text-white`}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl font-semibold">
              {current.icon}
            </div>

            <h2 className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="whitespace-pre-line text-sm font-normal leading-relaxed text-slate-600">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`${current.color} rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}