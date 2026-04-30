import { PublicLayout } from "@/components/layout/PublicLayout";
import { TimelineList } from "@/components/portfolio/TimelineList";
import { getEntries } from "@/lib/data";

export default async function TimelinePage() {
  const entries = await getEntries();
  return (
    <PublicLayout>
      <div className="mb-6"><p className="text-sm text-cyan-200">Timeline</p><h1 className="mt-2 text-4xl font-semibold">finalDate 기준 타임라인</h1></div>
      <TimelineList entries={entries} />
    </PublicLayout>
  );
}
