import { ReactNode } from "react";

export default function PremiumSelect({
  label,
  icon,
  children,
  ...props
}: {
  label?: string;
  icon?: ReactNode;
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <div>
      {label && (
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
        </label>
      )}

      <select
        {...props}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      >
        {children}
      </select>
    </div>
  );
}