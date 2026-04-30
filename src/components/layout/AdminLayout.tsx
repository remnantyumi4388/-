import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, Home, ListPlus, Shield, type LucideIcon } from "lucide-react";

const adminLinks: Array<[string, string, LucideIcon]> = [
  ["Dashboard", "/admin", Home],
  ["Entries", "/admin/entries", ListPlus],
  ["Files", "/admin/files", FileText]
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950/50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[250px_1fr] lg:px-8">
        <aside className="surface h-fit rounded-lg p-4">
          <Link className="mb-5 flex items-center gap-2 font-semibold" href="/">
            <span className="grid size-9 place-items-center rounded-lg bg-cyan-300 text-slate-950">
              <Shield size={18} />
            </span>
            Admin
          </Link>
          <nav className="grid gap-1">
            {adminLinks.map(([label, href, Icon]) => (
              <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white" href={href} key={href}>
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
