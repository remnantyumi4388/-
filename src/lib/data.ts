import { mockEntries } from "@/lib/mockData";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabaseAdmin";
import { hasSupabaseConfig, createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { EntryType, PortfolioEntry, PortfolioFile } from "@/lib/types";
import { sortByFinalDate } from "@/lib/date";

export type EntryPayload = {
  type: EntryType;
  title: string;
  summary?: string;
  description?: string;
  finalDate: string;
  tags?: string[];
  techStack?: string[];
  organization?: string;
  role?: string;
  result?: string;
  links?: PortfolioEntry["links"];
  thumbnailUrl?: string;
  isFeatured?: boolean;
  isPublic?: boolean;
};

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

function toDbPayload(ownerId: string, payload: EntryPayload) {
  return {
    owner_id: ownerId,
    type: payload.type,
    title: payload.title,
    summary: payload.summary ?? "",
    description: payload.description ?? "",
    final_date: payload.finalDate,
    tags: payload.tags ?? [],
    tech_stack: payload.techStack ?? [],
    organization: payload.organization ?? "",
    role: payload.role ?? "",
    result: payload.result ?? "",
    links: payload.links ?? {},
    thumbnail_url: payload.thumbnailUrl ?? "",
    is_featured: payload.isFeatured ?? false,
    is_public: payload.isPublic ?? true
  };
}

async function getFiles() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("portfolio_files").select("*").order("created_at", { ascending: false });
  return ((data ?? []) as DbFile[]).map(mapFile);
}

export async function getEntries(): Promise<PortfolioEntry[]> {
  if (hasSupabaseAdminConfig()) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const [{ data: entries }, files] = await Promise.all([
        supabase.from("portfolio_entries").select("*").eq("is_public", true).order("final_date", { ascending: false }),
        getFiles()
      ]);
      if (entries) return (entries as DbEntry[]).map((entry) => mapEntry(entry, files.filter((file) => file.entryId === entry.id)));
    }
  }

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
  return (entries as DbEntry[]).map((entry) => mapEntry(entry, mappedFiles.filter((file) => file.entryId === entry.id)));
}

export async function getEntryById(id: string): Promise<PortfolioEntry | null> {
  if (hasSupabaseAdminConfig()) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const [{ data: entry }, files] = await Promise.all([
        supabase.from("portfolio_entries").select("*").eq("id", id).eq("is_public", true).maybeSingle(),
        getFiles()
      ]);
      if (entry) return mapEntry(entry as DbEntry, files.filter((file) => file.entryId === id));
    }
  }

  return mockEntries.find((entry) => entry.id === id && entry.isPublic) ?? null;
}

export async function getAllEntriesForAdmin(ownerId?: string): Promise<PortfolioEntry[]> {
  if (hasSupabaseAdminConfig()) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const query = supabase.from("portfolio_entries").select("*").order("final_date", { ascending: false });
      const [{ data: entries }, files] = await Promise.all([ownerId ? query.eq("owner_id", ownerId) : query, getFiles()]);
      if (entries) return (entries as DbEntry[]).map((entry) => mapEntry(entry, files.filter((file) => file.entryId === entry.id)));
    }
  }

  if (!hasSupabaseConfig()) {
    return sortByFinalDate(ownerId ? mockEntries.filter((entry) => entry.ownerId === ownerId) : mockEntries);
  }

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return sortByFinalDate(ownerId ? mockEntries.filter((entry) => entry.ownerId === ownerId) : mockEntries);

  const [{ data: entries }, { data: files }] = await Promise.all([
    supabase.from("portfolio_entries").select("*").eq("owner_id", ownerId ?? "").order("final_date", { ascending: false }),
    supabase.from("portfolio_files").select("*").order("created_at", { ascending: false })
  ]);

  if (!entries) return sortByFinalDate(ownerId ? mockEntries.filter((entry) => entry.ownerId === ownerId) : mockEntries);

  const mappedFiles = ((files ?? []) as DbFile[]).map(mapFile);
  return (entries as DbEntry[]).map((entry) => mapEntry(entry, mappedFiles.filter((file) => file.entryId === entry.id)));
}

export async function createEntryForOwner(ownerId: string, payload: EntryPayload) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("portfolio_entries").insert(toDbPayload(ownerId, payload)).select("*").single();
  if (error || !data) return null;
  return mapEntry(data as DbEntry, []);
}

export async function updateEntryForOwner(ownerId: string, id: string, payload: EntryPayload) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("portfolio_entries")
    .update(toDbPayload(ownerId, payload))
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .single();
  if (error || !data) return null;
  return mapEntry(data as DbEntry, []);
}

export async function deleteEntryForOwner(ownerId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("portfolio_entries").delete().eq("id", id).eq("owner_id", ownerId);
  return !error;
}
