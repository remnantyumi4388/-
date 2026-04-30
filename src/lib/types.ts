export type EntryType = "project" | "activity" | "award" | "research";

export type FileType = "PDF" | "PPT" | "PPTX" | "IMAGE" | "ZIP" | "CODE" | "OTHER";

export type PortfolioFile = {
  id: string;
  entryId: string;
  fileName: string;
  fileLabel?: string;
  fileType: FileType;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  publicUrl?: string;
  createdAt: string;
};

export type PortfolioEntry = {
  id: string;
  ownerId: string;
  type: EntryType;
  title: string;
  summary?: string;
  description?: string;
  finalDate: string;
  tags: string[];
  techStack: string[];
  organization?: string;
  role?: string;
  result?: string;
  links?: {
    github?: string;
    demo?: string;
    notion?: string;
    blog?: string;
    etc?: string;
  };
  thumbnailUrl?: string;
  isFeatured: boolean;
  isPublic: boolean;
  files: PortfolioFile[];
  createdAt: string;
  updatedAt: string;
};

export type EntryFilters = {
  type?: EntryType | "all";
  query?: string;
  tech?: string;
  fileType?: FileType | "all";
  sort?: "newest" | "oldest";
};
