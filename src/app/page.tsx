import { ArrowRight, LockKeyhole } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ButtonLink } from "@/components/ui/Button";
import { StatsCards } from "@/components/portfolio/StatsCards";
import { getEntries } from "@/lib/data";

export default async function HomePage() {
  const entries = await getEntries();

  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-5xl gap-8 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-cyan-200">AI Portfolio Archive</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-white md:text-6xl">기록을 깔끔하게 모으는 포트폴리오</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            프로젝트, 활동, 수상, 연구 자료를 한 곳에 정리하고 각 사용자가 따로 로그인해서 관리합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/projects">
              기록 보기 <ArrowRight className="ml-2" size={16} />
            </ButtonLink>
            <ButtonLink href="/login" className="border border-slate-600 bg-transparent text-slate-100 hover:border-cyan-300 hover:bg-white/5">
              <LockKeyhole className="mr-2" size={16} />
              로그인
            </ButtonLink>
          </div>
        </div>
        <StatsCards entries={entries} />
      </section>
    </PublicLayout>
  );
}
