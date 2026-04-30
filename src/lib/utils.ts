import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EntryType } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const typeLabels: Record<EntryType, string> = {
  project: "Project",
  activity: "Activity",
  award: "Award",
  research: "Research"
};

export const typeNames: Record<EntryType, string> = {
  project: "프로젝트",
  activity: "활동",
  award: "수상",
  research: "연구"
};

export const typeStyles: Record<EntryType, string> = {
  project: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
  activity: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
  award: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  research: "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-100"
};

export const typeRoutes: Record<EntryType, string> = {
  project: "projects",
  activity: "activities",
  award: "awards",
  research: "research"
};
