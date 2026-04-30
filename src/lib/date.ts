import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDate(date: string) {
  return format(parseISO(date), "yyyy.MM.dd", { locale: ko });
}

export function formatMonth(date: string) {
  return format(parseISO(date), "yyyy년 M월", { locale: ko });
}

export function sortByFinalDate<T extends { finalDate: string }>(items: T[], direction: "newest" | "oldest" = "newest") {
  return [...items].sort((a, b) => {
    const diff = new Date(b.finalDate).getTime() - new Date(a.finalDate).getTime();
    return direction === "newest" ? diff : -diff;
  });
}
