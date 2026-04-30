import Link from "next/link";
import { cn } from "@/lib/utils";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition",
        variant === "primary" && "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
        variant === "secondary" && "border border-slate-600 bg-white text-slate-100 hover:border-cyan-300",
        variant === "ghost" && "bg-transparent text-slate-200 hover:bg-white/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center justify-center rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200", className)}>
      {children}
    </Link>
  );
}
