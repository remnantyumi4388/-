"use client";

import { Save, Upload } from "lucide-react";

export function EntryForm() {
  return (
    <form className="glass grid gap-4 rounded-lg p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="유형">
          <select className="field"><option>project</option><option>activity</option><option>award</option><option>research</option></select>
        </Field>
        <Field label="finalDate">
          <input type="date" className="field" />
        </Field>
      </div>
      <Field label="제목"><input className="field" placeholder="기록 제목" /></Field>
      <Field label="한 줄 설명"><input className="field" placeholder="카드에 표시될 요약" /></Field>
      <Field label="자세한 설명"><textarea className="field min-h-28" placeholder="과정, 역할, 결과를 정리하세요." /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="태그"><input className="field" placeholder="AI, Research, Award" /></Field>
        <Field label="기술 스택"><input className="field" placeholder="Python, React, Supabase" /></Field>
        <Field label="기관/소속"><input className="field" /></Field>
        <Field label="역할"><input className="field" /></Field>
      </div>
      <Field label="관련 링크"><input className="field" placeholder="GitHub, Demo, Notion URL" /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" defaultChecked /> 공개</label>
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" /> 대표 기록</label>
      </div>
      <div className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">
        <Upload className="mx-auto mb-2 text-cyan-200" />
        PDF, PPT, PPTX, PNG, JPG, WEBP, ZIP 파일을 Supabase Storage에 연결할 수 있게 분리된 업로드 영역입니다.
      </div>
      <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
        <Save size={16} />
        저장
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm text-slate-300"><span>{label}</span>{children}</label>;
}
