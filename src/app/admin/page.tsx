import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { StatsCards } from "@/components/portfolio/StatsCards";
import { getAllEntriesForAdmin } from "@/lib/data";
import { formatDate } from "@/lib/date";
import { requirePortfolioUser } from "@/lib/auth";
import { typeNames } from "@/lib/utils";

export default async function AdminPage() {
  const user = await requirePortfolioUser();
  const entries = await getAllEntriesForAdmin(user.id);

  return (
    <PublicLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-200">Admin / {user.name}</p>
          <h1 className="mt-2 text-4xl font-semibold">내 기록 관리</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/entries" className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">기록 관리</Link>
          <Link href="/admin/files" className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200">파일 관리</Link>
          <LogoutButton />
        </div>
      </div>
      <StatsCards entries={entries} />
      <section className="glass mt-6 rounded-lg p-5">
        <h2 className="text-2xl font-semibold">최근 기록</h2>
        <div className="mt-4 space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/5 p-4">
              <div>
                <p className="font-medium text-white">{entry.title}</p>
                <p className="text-sm text-slate-400">{typeNames[entry.type]} / {formatDate(entry.finalDate)}</p>
              </div>
              <span className="text-sm text-slate-400">{entry.files.length} files</span>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
