import { PublicLayout } from "@/components/layout/PublicLayout";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdminEntriesManager } from "@/components/admin/AdminEntriesManager";
import { getAllEntriesForAdmin } from "@/lib/data";
import { requirePortfolioUser } from "@/lib/auth";

export default async function AdminEntriesPage() {
  const user = await requirePortfolioUser();
  const entries = await getAllEntriesForAdmin(user.id);

  return (
    <PublicLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-200">Admin Entries / {user.name}</p>
          <h1 className="mt-2 text-4xl font-semibold">기록 관리</h1>
        </div>
        <LogoutButton />
      </div>
      <AdminEntriesManager ownerId={user.id} initialEntries={entries} />
    </PublicLayout>
  );
}
