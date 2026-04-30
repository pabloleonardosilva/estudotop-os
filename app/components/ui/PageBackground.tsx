import { ReactNode } from "react";

export default function PageBackground({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0,#f8fafc_34%,#eef2f7_100%)] px-4 py-8 md:px-8">
      <section className="mx-auto max-w-7xl">{children}</section>
    </main>
  );
}