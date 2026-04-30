import { ReactNode } from "react";

export default function PremiumCard({
  title,
  description,
  icon,
  children,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition hover:shadow-md">
      
      {/* Glow sutil */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-xl" />

      {(title || description || icon || action) && (
        <div className="relative mb-6 flex items-start justify-between">
          
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20">
                {icon}
              </div>
            )}

            <div>
              {title && (
                <h2 className="text-lg font-medium text-slate-950">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      <div className="relative">{children}</div>
    </div>
  );
}