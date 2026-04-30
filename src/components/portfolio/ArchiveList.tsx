"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { flattenFiles, formatFileSize } from "@/lib/file";
import type { FileType, PortfolioEntry } from "@/lib/types";

export function ArchiveList({ entries }: { entries: PortfolioEntry[] }) {
  const [query, setQuery] = useState("");
  const [fileType, setFileType] = useState<FileType | "all">("all");
  const files = useMemo(() => flattenFiles(entries), [entries]);
  const filtered = files.filter((file) => {
    const normalized = query.trim().toLowerCase();
    const matchesType = fileType === "all" || file.fileType === fileType;
    const matchesQuery = !normalized || [file.fileName, file.fileLabel, file.entryTitle].join(" ").toLowerCase().includes(normalized);
    return matchesType && matchesQuery;
  });

  return (
    <section className="space-y-5">
      <div className="glass grid gap-3 rounded-lg p-4 md:grid-cols-[1fr_180px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="파일명, 라벨, 연결 기록 검색" className="h-11 w-full rounded-md border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm outline-none focus:border-cyan-300" />
        </label>
        <select value={fileType} onChange={(event) => setFileType(event.target.value as FileType | "all")} className="h-11 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm outline-none focus:border-cyan-300">
          {["all", "PDF", "PPT", "PPTX", "IMAGE", "ZIP", "CODE", "OTHER"].map((type) => <option key={type} value={type}>{type === "all" ? "모든 파일" : type}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full min-w-[760px] border-collapse bg-slate-950/60 text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="p-4">파일</th>
              <th className="p-4">유형</th>
              <th className="p-4">연결 기록</th>
              <th className="p-4">크기</th>
              <th className="p-4">다운로드</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((file) => (
              <tr key={file.id} className="border-t border-slate-800">
                <td className="p-4 text-white">{file.fileLabel ?? file.fileName}<p className="text-xs text-slate-500">{file.fileName}</p></td>
                <td className="p-4 text-slate-300">{file.fileType}</td>
                <td className="p-4 text-slate-300">{file.entryTitle}</td>
                <td className="p-4 text-slate-400">{formatFileSize(file.fileSize)}</td>
                <td className="p-4"><a href={file.publicUrl ?? "#"} className="text-cyan-200 hover:text-cyan-100">열기</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
