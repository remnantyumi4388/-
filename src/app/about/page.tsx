import { PublicLayout } from "@/components/layout/PublicLayout";

const stacks = ["Python", "C", "HTML", "CSS", "JavaScript", "React", "Machine Learning", "Data Analysis", "Supabase"];

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm text-cyan-200">About</p>
          <h1 className="mt-3 text-4xl font-semibold">기록으로 성장하는 AI 개발자</h1>
          <p className="mt-5 leading-8 text-slate-300">
            AI 전공 학생으로서 데이터 분석, 서비스 기획, 프론트엔드 구현을 함께 학습합니다. 결과물만 보여주는 포트폴리오가 아니라
            어떤 문제를 정의했고 어떤 자료를 남겼는지까지 정리하는 포트폴리오를 지향합니다.
          </p>
        </div>
        <div className="glass rounded-lg p-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            {[
              ["이름", "Your Name"],
              ["전공", "Artificial Intelligence"],
              ["관심 분야", "AI 서비스, 추천 시스템, 데이터 분석"],
              ["진로 목표", "사용자의 문제를 작게 발견하고 빠르게 구현하는 개발자"]
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-slate-400">{label}</dt>
                <dd className="mt-1 font-medium text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-lg p-6">
          <h2 className="text-2xl font-semibold">기술 스택</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {stacks.map((stack) => <span key={stack} className="rounded-md bg-white/8 px-3 py-2 text-sm text-slate-200">{stack}</span>)}
          </div>
        </div>
        <div className="glass rounded-lg p-6">
          <h2 className="text-2xl font-semibold">학습 로드맵</h2>
          <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
            <li>1. Python과 데이터 분석 기본기를 프로젝트 기록으로 축적</li>
            <li>2. 머신러닝 개념을 보고서와 실험 자료로 정리</li>
            <li>3. React와 Next.js로 결과물을 실제 서비스 형태로 배포</li>
            <li>4. Supabase를 연결해 직접 관리 가능한 포트폴리오로 확장</li>
          </ol>
        </div>
      </section>
    </PublicLayout>
  );
}
