import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArchiveList } from "@/components/portfolio/ArchiveList";
import { getEntries } from "@/lib/data";

export default async function ArchivePage() {
  const entries = await getEntries();
  return (
    <PublicLayout>
      <div className="mb-6"><p className="text-sm text-cyan-200">Archive</p><h1 className="mt-2 text-4xl font-semibold">자료 저장소</h1></div>
      <ArchiveList entries={entries} />
    </PublicLayout>
  );
}
