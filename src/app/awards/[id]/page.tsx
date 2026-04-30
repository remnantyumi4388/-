import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { EntryDetailPage } from "@/components/portfolio/EntryDetailPage";
import { getEntryById } from "@/lib/data";

export default async function AwardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getEntryById(id);
  if (!entry || entry.type !== "award") notFound();

  return <PublicLayout><EntryDetailPage entry={entry} /></PublicLayout>;
}
