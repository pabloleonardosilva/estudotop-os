import { ReactNode } from "react";

export default function PremiumInput({
  label,
  icon,
  textarea = false,
  uppercase = false,
  onChange,
  ...props
}: {
  label?: string;
  icon?: ReactNode;
  textarea?: boolean;
  uppercase?: boolean;
  onChange?: (e: any) => void;
  [key: string]: any;
}) {
  function handleChange(e: any) {
    if (!onChange) return;

    if (uppercase) {
      e.target.value = e.target.value.toUpperCase();
    }

    onChange(e);
  }

  return (
    <div>
      {label && (
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
        </label>
      )}

      {textarea ? (
        <textarea
          {...props}
          onChange={handleChange}
          className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />
      ) : (
        <input
          {...props}
          onChange={handleChange}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />
      )}
    </div>
  );
}