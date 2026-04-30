"use client";

import { Edit3, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate, sortByFinalDate } from "@/lib/date";
import { ownerEntriesKey, readStoredEntries, removePublicEntry, upsertPublicEntry, writeStoredEntries } from "@/lib/localEntries";
import type { EntryType, PortfolioEntry } from "@/lib/types";
import { typeNames } from "@/lib/utils";

const baseForm = {
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
  thumbnailUrl: "",
  github: "",
  demo: "",
  notion: "",
  blog: "",
  isPublic: true,
  isFeatured: false
};

type EntryFormState = typeof baseForm;

export function AdminEntriesManager({ ownerId, initialEntries }: { ownerId: string; initialEntries: PortfolioEntry[] }) {
  const storageKey = ownerEntriesKey(ownerId);
  const [entries, setEntries] = useState<PortfolioEntry[]>(initialEntries);
  const [form, setForm] = useState<EntryFormState>(baseForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const localEntries = readStoredEntries(storageKey);
    const existingIds = new Set(initialEntries.map((entry) => entry.id));
    setEntries(sortByFinalDate([...localEntries.filter((entry) => !existingIds.has(entry.id)), ...initialEntries]));
  }, [initialEntries, storageKey]);

  const sortedEntries = useMemo(() => sortByFinalDate(entries), [entries]);

  function update<K extends keyof EntryFormState>(key: K, value: EntryFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const payload = toPayload(form);
    const localEntry = makeLocalEntry(ownerId, payload, editingId ?? undefined);
    const isEditing = Boolean(editingId);
    const url = isEditing ? `/api/entries/${editingId}` : "/api/entries";
    const method = isEditing ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const { entry } = (await response.json()) as { entry: PortfolioEntry };
      setEntries((current) => sortByFinalDate([entry, ...current.filter((item) => item.id !== entry.id)]));
      setMessage("Supabase에 저장했습니다.");
    } else {
      const nextLocal = isEditing
        ? readStoredEntries(storageKey).map((entry) => (entry.id === editingId ? localEntry : entry))
        : [localEntry, ...readStoredEntries(storageKey)];
      writeStoredEntries(storageKey, nextLocal);
      setEntries((current) => sortByFinalDate([localEntry, ...current.filter((item) => item.id !== editingId && item.id !== localEntry.id)]));
      upsertPublicEntry(localEntry);
      setMessage("Supabase 설정 전이라 이 브라우저에 임시 저장했습니다.");
    }

    setForm(baseForm);
    setEditingId(null);
  }

  function startEdit(entry: PortfolioEntry) {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      title: entry.title,
      summary: entry.summary ?? "",
      description: entry.description ?? "",
      finalDate: entry.finalDate,
      tags: entry.tags.join(", "),
      techStack: entry.techStack.join(", "),
      organization: entry.organization ?? "",
      role: entry.role ?? "",
      result: entry.result ?? "",
      thumbnailUrl: entry.thumbnailUrl ?? "",
      github: entry.links?.github ?? "",
      demo: entry.links?.demo ?? "",
      notion: entry.links?.notion ?? "",
      blog: entry.links?.blog ?? "",
      isPublic: entry.isPublic,
      isFeatured: entry.isFeatured
    });
  }

  async function remove(entry: PortfolioEntry) {
    const response = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    removePublicEntry(entry.id);

    const nextLocal = readStoredEntries(storageKey).filter((item) => item.id !== entry.id);
    writeStoredEntries(storageKey, nextLocal);
    setMessage(response.ok ? "삭제했습니다." : "브라우저 저장 기록에서 삭제했습니다.");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(baseForm);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <form className="glass grid gap-4 rounded-lg p-5" onSubmit={save}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">{editingId ? "기록 수정" : "기록 추가"}</h2>
          {editingId ? (
            <button className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white" onClick={cancelEdit} type="button">
              <X size={15} />
              취소
            </button>
          ) : null}
        </div>
        {message ? <p className="rounded-md bg-white/5 px-3 py-2 text-sm text-cyan-200">{message}</p> : null}
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
        <Field label="대표 이미지 URL">
          <input className="field" value={form.thumbnailUrl} onChange={(event) => update("thumbnailUrl", event.target.value)} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="GitHub">
            <input className="field" value={form.github} onChange={(event) => update("github", event.target.value)} />
          </Field>
          <Field label="Demo">
            <input className="field" value={form.demo} onChange={(event) => update("demo", event.target.value)} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <label className="flex items-center gap-2"><input checked={form.isPublic} onChange={(event) => update("isPublic", event.target.checked)} type="checkbox" /> 공개</label>
          <label className="flex items-center gap-2"><input checked={form.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} type="checkbox" /> 대표 기록</label>
        </div>
        <button className="h-11 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200" type="submit">
          {editingId ? "수정하기" : "추가하기"}
        </button>
      </form>

      <div className="glass rounded-lg p-5">
        <h2 className="text-2xl font-semibold">내 기록</h2>
        <div className="mt-4 space-y-3">
          {sortedEntries.map((entry) => (
            <div key={entry.id} className="rounded-lg bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-slate-400">{typeNames[entry.type]} / {formatDate(entry.finalDate)}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-slate-400 hover:text-cyan-200" onClick={() => startEdit(entry)} type="button" aria-label="수정">
                    <Edit3 size={16} />
                  </button>
                  <button className="text-slate-400 hover:text-red-300" onClick={() => remove(entry)} type="button" aria-label="삭제">
                    <Trash2 size={16} />
                  </button>
                </div>
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

function toPayload(form: EntryFormState) {
  return {
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
    thumbnailUrl: form.thumbnailUrl.trim(),
    links: {
      github: form.github.trim(),
      demo: form.demo.trim(),
      notion: form.notion.trim(),
      blog: form.blog.trim()
    },
    isFeatured: form.isFeatured,
    isPublic: form.isPublic
  };
}

function makeLocalEntry(ownerId: string, payload: ReturnType<typeof toPayload>, existingId?: string): PortfolioEntry {
  const now = new Date().toISOString();
  return {
    id: existingId?.startsWith("local-") ? existingId : `local-${crypto.randomUUID()}`,
    ownerId,
    ...payload,
    files: [],
    createdAt: now,
    updatedAt: now
  };
}
