"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TagInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (values: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const value = draft.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setDraft("");
  }

  return (
    <label className="grid gap-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <div className="flex gap-2">
        <input
          className="field"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          value={draft}
        />
        <Button onClick={addValue} type="button" variant="secondary">추가</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 text-xs" key={value}>
            {value}
            <button aria-label={`${value} 삭제`} onClick={() => onChange(values.filter((item) => item !== value))} type="button">
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    </label>
  );
}
