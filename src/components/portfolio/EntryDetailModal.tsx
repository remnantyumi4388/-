"use client";

import { X } from "lucide-react";
import type { PortfolioEntry } from "@/lib/types";
import { formatDate } from "@/lib/date";
import { typeLabels } from "@/lib/utils";
import { FileBadge } from "@/components/portfolio/FileBadge";
import { Button } from "@/components/ui/Button";

export function EntryDetailModal({ entry, onClose }: { entry: PortfolioEntry | null; onClose: () => void }) {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog">
      <div className="glass max-h-[88vh] w-full max-w-2xl overflow-auto rounded-lg">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
          <div>
            <p className="text-sm text-cyan-200">{typeLabels[entry.type]} / {formatDate(entry.finalDate)}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{entry.title}</h2>
          </div>
          <Button aria-label="닫기" className="h-10 w-10 p-0" onClick={onClose} variant="ghost">
            <X size={19} />
          </Button>
        </div>
        <div className="grid gap-5 p-5">
          {entry.thumbnailUrl ? <img alt="" className="h-56 w-full rounded-lg object-cover" src={entry.thumbnailUrl} /> : null}
          <p className="leading-7 text-slate-300">{entry.description ?? entry.summary}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="기관/소속" value={entry.organization} />
            <Info label="역할" value={entry.role} />
            <Info label="결과" value={entry.result} />
            <Info label="Final Date" value={formatDate(entry.finalDate)} />
          </dl>
          <div className="flex flex-wrap gap-2">
            {[...entry.tags, ...entry.techStack].map((item) => (
              <span className="rounded-md bg-white/10 px-3 py-1 text-xs text-slate-200" key={item}>{item}</span>
            ))}
          </div>
          {entry.files.length ? (
            <div className="grid gap-2">
              <h3 className="font-semibold">첨부 파일</h3>
              {entry.files.map((file) => <FileBadge file={file} key={file.id} />)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value ?? "미입력"}</dd>
    </div>
  );
}
