import { ReactNode } from "react";

export default function PageHeader({
  eyebrow = "EstudoTOP OS",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="relative mb-7 overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
      <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-16 rounded-full bg-orange-500/10 blur-2xl" />
      <div className="absolute bottom-0 right-24 h-32 w-32 translate-y-16 rounded-full bg-amber-400/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            {eyebrow}
          </p>

          <h1 className="mt-3 text-4xl font-medium tracking-tight text-slate-950">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>

        {action && <div>{action}</div>}
      </div>
    </header>
  );
}