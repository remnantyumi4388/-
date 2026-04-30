import type { FileType, PortfolioFile } from "@/lib/types";

const allowedExtensions = ["pdf", "ppt", "pptx", "png", "jpg", "jpeg", "webp", "zip"];

export function getFileType(fileName: string): FileType {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "PDF";
  if (extension === "ppt") return "PPT";
  if (extension === "pptx") return "PPTX";
  if (["png", "jpg", "jpeg", "webp"].includes(extension ?? "")) return "IMAGE";
  if (extension === "zip") return "ZIP";
  return "OTHER";
}

export function isAllowedFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return Boolean(extension && allowedExtensions.includes(extension));
}

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function flattenFiles(entries: { title: string; files: PortfolioFile[] }[]) {
  return entries.flatMap((entry) =>
    entry.files.map((file) => ({
      ...file,
      entryTitle: entry.title
    }))
  );
}
