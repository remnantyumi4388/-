import Link from "next/link";
import { Archive, LockKeyhole } from "lucide-react";

const nav = [
  ["About", "/about"],
  ["Projects", "/projects"],
  ["Activities", "/activities"],
  ["Awards", "/awards"],
  ["Research", "/research"],
  ["Archive", "/archive"],
  ["Timeline", "/timeline"],
  ["Contact", "/contact"]
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-950/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300 text-slate-950">
            <Archive size={18} />
          </span>
          AI Portfolio Archive
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/8 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300 hover:text-white">
          <LockKeyhole size={16} />
          Admin
        </Link>
      </div>
    </header>
  );
}
