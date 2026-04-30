import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FileBadge } from "@/components/portfolio/FileBadge";
import { formatDate } from "@/lib/date";
import type { PortfolioEntry } from "@/lib/types";
import { typeLabels, typeRoutes } from "@/lib/utils";

export function EntryDetailPage({ entry }: { entry: PortfolioEntry }) {
  const links = Object.entries(entry.links ?? {}).filter(([, value]) => Boolean(value));

  return (
    <article className="mx-auto max-w-4xl">
      <Link className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white" href={`/${typeRoutes[entry.type]}`}>
        <ArrowLeft size={16} />
        목록으로
      </Link>
      <div className="glass mt-5 rounded-lg p-6">
        <p className="text-sm text-cyan-200">{typeLabels[entry.type]} / {formatDate(entry.finalDate)}</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">{entry.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">{entry.description || entry.summary}</p>

        <dl className="mt-8 grid gap-4 text-sm md:grid-cols-3">
          <Info label="기관/소속" value={entry.organization} />
          <Info label="역할" value={entry.role} />
          <Info label="결과" value={entry.result} />
        </dl>

        <div className="mt-8 flex flex-wrap gap-2">
          {[...entry.tags, ...entry.techStack].map((item) => (
            <span className="rounded-md bg-white/10 px-3 py-1 text-sm text-slate-200" key={item}>{item}</span>
          ))}
        </div>

        {links.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map(([label, href]) => (
              <a className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-3 py-2 text-sm text-cyan-200 hover:border-cyan-300" href={href} key={label} rel="noreferrer" target="_blank">
                {label}
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        ) : null}

        {entry.files.length ? (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">첨부 파일</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.files.map((file) => <FileBadge file={file} key={file.id} />)}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-200">{value || "미입력"}</dd>
    </div>
  );
}
