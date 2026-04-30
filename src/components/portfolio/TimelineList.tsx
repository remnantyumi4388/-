import type { PortfolioEntry } from "@/lib/types";
import { formatDate, formatMonth, sortByFinalDate } from "@/lib/date";
import { typeNames } from "@/lib/utils";

export function TimelineList({ entries }: { entries: PortfolioEntry[] }) {
  const groups = sortByFinalDate(entries).reduce<Record<string, PortfolioEntry[]>>((acc, entry) => {
    const month = formatMonth(entry.finalDate);
    acc[month] = [...(acc[month] ?? []), entry];
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([month, items]) => (
        <section key={month} className="glass rounded-lg p-5">
          <h2 className="text-xl font-semibold">{month}</h2>
          <div className="mt-5 space-y-4 border-l border-slate-700 pl-5">
            {items.map((entry) => (
              <div key={entry.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-cyan-300" />
                <p className="text-xs text-slate-400">{formatDate(entry.finalDate)} / {typeNames[entry.type]}</p>
                <h3 className="mt-1 font-semibold text-white">{entry.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{entry.summary}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
