"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300" onClick={logout} type="button">
      <LogOut size={16} />
      로그아웃
    </button>
  );
}
