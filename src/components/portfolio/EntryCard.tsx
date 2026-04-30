"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ExternalLink, Files } from "lucide-react";
import { useState } from "react";
import type { PortfolioEntry } from "@/lib/types";
import { formatDate } from "@/lib/date";
import { typeLabels, typeRoutes, typeStyles } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { FileBadge } from "@/components/portfolio/FileBadge";
import { EntryDetailModal } from "@/components/portfolio/EntryDetailModal";

export function EntryCard({ entry }: { entry: PortfolioEntry }) {
  const [isOpen, setIsOpen] = useState(false);
  const links = Object.entries(entry.links ?? {}).filter(([, value]) => Boolean(value));
  const detailHref = `/${typeRoutes[entry.type]}/${entry.id}`;
  const isLocal = entry.id.startsWith("local-");

  const cardBody = (
    <>
      {entry.thumbnailUrl ? (
        <div className="relative aspect-[16/9]">
          <Image src={entry.thumbnailUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ) : null}
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={typeStyles[entry.type]}>{typeLabels[entry.type]}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays size={14} />
            {formatDate(entry.finalDate)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Files size={14} />
            {entry.files.length}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{entry.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...entry.tags, ...entry.techStack].slice(0, 7).map((tag) => (
            <span key={tag} className="rounded-md bg-white/7 px-2.5 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>
        <span className="inline-flex text-sm font-medium text-cyan-200">자세히 보기</span>
      </div>
    </>
  );

  return (
    <>
      <article className="glass overflow-hidden rounded-lg transition hover:border-cyan-300">
        {isLocal ? (
          <button className="block w-full text-left" onClick={() => setIsOpen(true)} type="button">{cardBody}</button>
        ) : (
          <Link className="block" href={detailHref}>{cardBody}</Link>
        )}
        <div className="space-y-3 px-5 pb-5">
          {entry.files.length > 0 ? <div className="flex flex-wrap gap-2">{entry.files.slice(0, 2).map((file) => <FileBadge key={file.id} file={file} />)}</div> : null}
          {links.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
              {links.map(([label, href]) => (
                <a key={label} href={href} className="inline-flex items-center gap-1 text-sm text-cyan-200 hover:text-cyan-100" target="_blank" rel="noreferrer">
                  {label}
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </article>
      <EntryDetailModal entry={isOpen ? entry : null} onClose={() => setIsOpen(false)} />
    </>
  );
}
