import { PublicLayout } from "@/components/layout/PublicLayout";
import { EntryGrid } from "@/components/portfolio/EntryGrid";
import { getEntries } from "@/lib/data";

export default async function ResearchPage() {
  const entries = await getEntries();
  return (
    <PublicLayout>
      <div className="mb-6"><p className="text-sm text-cyan-200">Research</p><h1 className="mt-2 text-4xl font-semibold">연구 자료</h1></div>
      <EntryGrid entries={entries} fixedType="research" />
    </PublicLayout>
  );
}
