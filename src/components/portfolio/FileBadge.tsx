import { Download } from "lucide-react";
import type { PortfolioFile } from "@/lib/types";
import { formatFileSize } from "@/lib/file";

export function FileBadge({ file }: { file: PortfolioFile }) {
  return (
    <a href={file.publicUrl ?? "#"} className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-200 hover:border-cyan-300">
      <Download size={14} />
      <span>{file.fileLabel ?? file.fileName}</span>
      <span className="text-slate-500">{file.fileType}</span>
      <span className="text-slate-500">{formatFileSize(file.fileSize)}</span>
    </a>
  );
}
