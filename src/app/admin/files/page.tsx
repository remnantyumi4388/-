import { PublicLayout } from "@/components/layout/PublicLayout";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ArchiveList } from "@/components/portfolio/ArchiveList";
import { getAllEntriesForAdmin } from "@/lib/data";
import { requirePortfolioUser } from "@/lib/auth";

export default async function AdminFilesPage() {
  const user = await requirePortfolioUser();
  const entries = await getAllEntriesForAdmin(user.id);

  return (
    <PublicLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-200">Admin Files / {user.name}</p>
          <h1 className="mt-2 text-4xl font-semibold">파일 관리</h1>
        </div>
        <LogoutButton />
      </div>
      <ArchiveList entries={entries} />
    </PublicLayout>
  );
}
