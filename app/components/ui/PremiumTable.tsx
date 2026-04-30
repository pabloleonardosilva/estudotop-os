import { ReactNode } from "react";

export function PremiumTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function PremiumTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-slate-50 text-slate-500">
      {children}
    </thead>
  );
}

export function PremiumTableHeader({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`px-4 py-3 font-medium ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function PremiumTableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-slate-100">
      {children}
    </tbody>
  );
}

export function PremiumTableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="transition hover:bg-orange-50/40">
      {children}
    </tr>
  );
}

export function PremiumTableCell({
  children,
  align = "left",
  colSpan,
}: {
  children: ReactNode;
  align?: "left" | "right";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-4 text-slate-600 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}