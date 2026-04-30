import { PublicLayout } from "@/components/layout/PublicLayout";
import { EntryGrid } from "@/components/portfolio/EntryGrid";
import { getEntries } from "@/lib/data";

export default async function ProjectsPage() {
  const entries = await getEntries();
  return (
    <PublicLayout>
      <PageTitle label="Projects" title="프로젝트 포트폴리오" />
      <EntryGrid entries={entries} fixedType="project" />
    </PublicLayout>
  );
}

function PageTitle({ label, title }: { label: string; title: string }) {
  return <div className="mb-6"><p className="text-sm text-cyan-200">{label}</p><h1 className="mt-2 text-4xl font-semibold">{title}</h1></div>;
}
