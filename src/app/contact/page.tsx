import { Github, Mail, NotebookText, Rss, type LucideIcon } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";

const contacts: Array<[string, string, string, LucideIcon]> = [
  ["Email", "hello@example.com", "mailto:hello@example.com", Mail],
  ["GitHub", "github.com/your-id", "https://github.com/", Github],
  ["Notion", "notion.so/your-page", "https://notion.so/", NotebookText],
  ["Blog", "your-blog.example.com", "https://example.com/", Rss]
];

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="mb-6"><p className="text-sm text-cyan-200">Contact</p><h1 className="mt-2 text-4xl font-semibold">연락처와 링크</h1></div>
      <div className="grid gap-5 md:grid-cols-2">
        {contacts.map(([label, value, href, Icon]) => (
          <a key={label} href={href} className="glass flex items-center gap-4 rounded-lg p-5 hover:border-cyan-300" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-300 text-slate-950"><Icon size={20} /></span>
            <span><span className="block text-sm text-slate-400">{label}</span><span className="font-semibold text-white">{value}</span></span>
          </a>
        ))}
      </div>
    </PublicLayout>
  );
}
