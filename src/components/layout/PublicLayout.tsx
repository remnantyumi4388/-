import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-5 py-10">{children}</main>
      <Footer />
    </div>
  );
}
