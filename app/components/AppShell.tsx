"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isHome = pathname === "/";

  if (isHome) {
    return (
      <>
        <Header />
        <main>{children}</main>
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#e9e9ec]">
      <Sidebar />

      <div className="flex-1">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}