import { mockEntries } from "@/lib/mockData";
import { hasSupabaseConfig, createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { PortfolioEntry, PortfolioFile } from "@/lib/types";
import { sortByFinalDate } from "@/lib/date";

type DbEntry = {
  id: string;
  owner_id: string | null;
  type: PortfolioEntry["type"];
  title: string;
  summary: string | null;
  description: string | null;
  final_date: string;
  tags: string[] | null;
  tech_stack: string[] | null;
  organization: string | null;
  role: string | null;
  result: string | null;
  links: PortfolioEntry["links"] | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type DbFile = {
  id: string;
  entry_id: string;
  file_name: string;
  file_label: string | null;
  file_type: PortfolioFile["fileType"];
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string | null;
  created_at: string;
};

function mapEntry(entry: DbEntry, files: PortfolioFile[]): PortfolioEntry {
  return {
    id: entry.id,
    ownerId: entry.owner_id ?? "user-a",
    type: entry.type,
    title: entry.title,
    summary: entry.summary ?? undefined,
    description: entry.description ?? undefined,
    finalDate: entry.final_date,
    tags: entry.tags ?? [],
    techStack: entry.tech_stack ?? [],
    organization: entry.organization ?? undefined,
    role: entry.role ?? undefined,
    result: entry.result ?? undefined,
    links: entry.links ?? {},
    thumbnailUrl: entry.thumbnail_url ?? undefined,
    isFeatured: entry.is_featured,
    isPublic: entry.is_public,
    files,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at
  };
}

function mapFile(file: DbFile): PortfolioFile {
  return {
    id: file.id,
    entryId: file.entry_id,
    fileName: file.file_name,
    fileLabel: file.file_label ?? undefined,
    fileType: file.file_type,
    mimeType: file.mime_type,
    fileSize: file.file_size,
    storagePath: file.storage_path,
    publicUrl: file.public_url ?? undefined,
    createdAt: file.created_at
  };
}

export async function getEntries(): Promise<PortfolioEntry[]> {
  if (!hasSupabaseConfig()) {
    return sortByFinalDate(mockEntries);
  }

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return sortByFinalDate(mockEntries);

  const [{ data: entries, error: entriesError }, { data: files, error: filesError }] = await Promise.all([
    supabase.from("portfolio_entries").select("*").eq("is_public", true).order("final_date", { ascending: false }),
    supabase.from("portfolio_files").select("*").order("created_at", { ascending: false })
  ]);

  if (entriesError || filesError || !entries) {
    return sortByFinalDate(mockEntries);
  }

  const mappedFiles = ((files ?? []) as DbFile[]).map(mapFile);
  return (entries as DbEntry[]).map((entry) =>
    mapEntry(
      entry,
      mappedFiles.filter((file) => file.entryId === entry.id)
    )
  );
}

export async function getAllEntriesForAdmin(ownerId?: string): Promise<PortfolioEntry[]> {
  if (!hasSupabaseConfig()) {
    return sortByFinalDate(ownerId ? mockEntries.filter((entry) => entry.ownerId === ownerId) : mockEntries);
  }

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return sortByFinalDate(ownerId ? mockEntries.filter((entry) => entry.ownerId === ownerId) : mockEntries);

  const [{ data: entries }, { data: files }] = await Promise.all([
    supabase
      .from("portfolio_entries")
      .select("*")
      .eq("owner_id", ownerId ?? "")
      .order("final_date", { ascending: false }),
    supabase.from("portfolio_files").select("*").order("created_at", { ascending: false })
  ]);

  if (!entries) return sortByFinalDate(ownerId ? mockEntries.filter((entry) => entry.ownerId === ownerId) : mockEntries);

  const mappedFiles = ((files ?? []) as DbFile[]).map(mapFile);
  return (entries as DbEntry[]).map((entry) =>
    mapEntry(
      entry,
      mappedFiles.filter((file) => file.entryId === entry.id)
    )
  );
}
