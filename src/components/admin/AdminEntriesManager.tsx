"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate, sortByFinalDate } from "@/lib/date";
import { ownerEntriesKey, readStoredEntries, removePublicEntry, upsertPublicEntry, writeStoredEntries } from "@/lib/localEntries";
import type { EntryType, PortfolioEntry } from "@/lib/types";
import { typeNames } from "@/lib/utils";

const emptyForm = {
  type: "project" as EntryType,
  title: "",
  summary: "",
  description: "",
  finalDate: new Date().toISOString().slice(0, 10),
  tags: "",
  techStack: "",
  organization: "",
  role: "",
  result: "",
  isPublic: true,
  isFeatured: false
};

export function AdminEntriesManager({ ownerId, initialEntries }: { ownerId: string; initialEntries: PortfolioEntry[] }) {
  const storageKey = ownerEntriesKey(ownerId);
  const [storedEntries, setStoredEntries] = useState<PortfolioEntry[]>([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setStoredEntries(readStoredEntries(storageKey));
  }, [storageKey]);

  const entries = useMemo(() => sortByFinalDate([...storedEntries, ...initialEntries]), [initialEntries, storedEntries]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const entry: PortfolioEntry = {
      id: `local-${crypto.randomUUID()}`,
      ownerId,
      type: form.type,
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      finalDate: form.finalDate,
      tags: splitList(form.tags),
      techStack: splitList(form.techStack),
      organization: form.organization.trim(),
      role: form.role.trim(),
      result: form.result.trim(),
      links: {},
      thumbnailUrl: "",
      isFeatured: form.isFeatured,
      isPublic: form.isPublic,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextEntries = [entry, ...storedEntries];
    setStoredEntries(nextEntries);
    writeStoredEntries(storageKey, nextEntries);
    upsertPublicEntry(entry);
    setForm(emptyForm);
  }

  function remove(entryId: string) {
    const nextEntries = storedEntries.filter((entry) => entry.id !== entryId);
    setStoredEntries(nextEntries);
    writeStoredEntries(storageKey, nextEntries);
    removePublicEntry(entryId);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <form className="glass grid gap-4 rounded-lg p-5" onSubmit={save}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="유형">
            <select className="field" value={form.type} onChange={(event) => update("type", event.target.value as EntryType)}>
              <option value="project">프로젝트</option>
              <option value="activity">활동</option>
              <option value="award">수상</option>
              <option value="research">연구</option>
            </select>
          </Field>
          <Field label="날짜">
            <input className="field" type="date" value={form.finalDate} onChange={(event) => update("finalDate", event.target.value)} />
          </Field>
        </div>
        <Field label="제목">
          <input className="field" placeholder="예: AI 프로젝트 발표" value={form.title} onChange={(event) => update("title", event.target.value)} />
        </Field>
        <Field label="요약">
          <input className="field" placeholder="카드에 보일 짧은 설명" value={form.summary} onChange={(event) => update("summary", event.target.value)} />
        </Field>
        <Field label="상세 설명">
          <textarea className="field min-h-24" value={form.description} onChange={(event) => update("description", event.target.value)} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="태그">
            <input className="field" placeholder="AI, 발표, 보고서" value={form.tags} onChange={(event) => update("tags", event.target.value)} />
          </Field>
          <Field label="기술 스택">
            <input className="field" placeholder="Python, React" value={form.techStack} onChange={(event) => update("techStack", event.target.value)} />
          </Field>
          <Field label="기관/소속">
            <input className="field" value={form.organization} onChange={(event) => update("organization", event.target.value)} />
          </Field>
          <Field label="역할">
            <input className="field" value={form.role} onChange={(event) => update("role", event.target.value)} />
          </Field>
        </div>
        <Field label="결과">
          <input className="field" value={form.result} onChange={(event) => update("result", event.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <label className="flex items-center gap-2"><input checked={form.isPublic} onChange={(event) => update("isPublic", event.target.checked)} type="checkbox" /> 공개</label>
          <label className="flex items-center gap-2"><input checked={form.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} type="checkbox" /> 대표 기록</label>
        </div>
        <button className="h-11 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200" type="submit">
          추가하기
        </button>
      </form>

      <div className="glass rounded-lg p-5">
        <h2 className="text-2xl font-semibold">내 기록</h2>
        <div className="mt-4 space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-slate-400">{typeNames[entry.type]} / {formatDate(entry.finalDate)}</p>
                </div>
                {entry.id.startsWith("local-") ? (
                  <button className="text-slate-400 hover:text-red-300" onClick={() => remove(entry.id)} type="button" aria-label="삭제">
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm text-slate-300"><span>{label}</span>{children}</label>;
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
