import { PublicLayout } from "@/components/layout/PublicLayout";
import { EntryGrid } from "@/components/portfolio/EntryGrid";
import { getEntries } from "@/lib/data";

export default async function AwardsPage() {
  const entries = await getEntries();
  return (
    <PublicLayout>
      <div className="mb-6"><p className="text-sm text-cyan-200">Awards</p><h1 className="mt-2 text-4xl font-semibold">수상 기록</h1></div>
      <EntryGrid entries={entries} fixedType="award" />
    </PublicLayout>
  );
}
