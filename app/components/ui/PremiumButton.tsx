import { ReactNode } from "react";

export default function PremiumButton({
  children,
  icon,
  variant = "primary",
  full = false,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  full?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition";

  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 hover:shadow-xl",
    secondary:
      "border border-slate-200 bg-white text-slate-800 hover:bg-slate-100",
    ghost:
      "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${
        full ? "w-full" : ""
      } ${disabled ? "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none" : ""}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}