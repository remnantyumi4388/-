"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EntryCard } from "@/components/portfolio/EntryCard";
import { sortByFinalDate } from "@/lib/date";
import { PUBLIC_ENTRIES_KEY, readStoredEntries } from "@/lib/localEntries";
import type { EntryType, PortfolioEntry } from "@/lib/types";

export function EntryGrid({ entries, fixedType }: { entries: PortfolioEntry[]; fixedType?: EntryType }) {
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [localEntries, setLocalEntries] = useState<PortfolioEntry[]>([]);

  useEffect(() => {
    setLocalEntries(readStoredEntries(PUBLIC_ENTRIES_KEY));
  }, []);

  const allEntries = useMemo(() => {
    const existingIds = new Set(entries.map((entry) => entry.id));
    return [...localEntries.filter((entry) => !existingIds.has(entry.id)), ...entries];
  }, [entries, localEntries]);

  const techOptions = useMemo(() => Array.from(new Set(allEntries.flatMap((entry) => entry.techStack))).sort(), [allEntries]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sortByFinalDate(
      allEntries.filter((entry) => {
        const matchesType = fixedType ? entry.type === fixedType : true;
        const matchesTech = tech === "all" ? true : entry.techStack.includes(tech);
        const haystack = [entry.title, entry.summary, entry.description, ...entry.tags, ...entry.techStack].join(" ").toLowerCase();
        return matchesType && matchesTech && (!normalized || haystack.includes(normalized));
      }),
      sort
    );
  }, [allEntries, fixedType, query, sort, tech]);

  return (
    <section className="space-y-5">
      <div className="glass grid gap-3 rounded-lg p-4 md:grid-cols-[1fr_180px_150px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="검색어, 태그, 설명" className="h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm outline-none focus:border-cyan-300" />
        </label>
        <select value={tech} onChange={(event) => setTech(event.target.value)} className="h-11 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm outline-none focus:border-cyan-300">
          <option value="all">모든 기술</option>
          {techOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")} className="h-11 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm outline-none focus:border-cyan-300">
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
      </div>
    </section>
  );
}
