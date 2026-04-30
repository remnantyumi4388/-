import { Archive, Award, FileText, FlaskConical, FolderKanban, Presentation, type LucideIcon } from "lucide-react";
import type { PortfolioEntry } from "@/lib/types";
import { flattenFiles } from "@/lib/file";

export function StatsCards({ entries }: { entries: PortfolioEntry[] }) {
  const stats: Array<[string, number, LucideIcon]> = [
    ["Projects", entries.filter((entry) => entry.type === "project").length, FolderKanban],
    ["Activities", entries.filter((entry) => entry.type === "activity").length, Presentation],
    ["Awards", entries.filter((entry) => entry.type === "award").length, Award],
    ["Research", entries.filter((entry) => entry.type === "research").length, FlaskConical],
    ["Files", flattenFiles(entries).length, FileText],
    ["Total", entries.length, Archive]
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map(([label, value, Icon]) => (
        <div key={label} className="glass rounded-lg p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{label}</p>
            <Icon className="text-cyan-200" size={20} />
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
