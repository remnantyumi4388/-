"use client";

import type { PortfolioEntry } from "@/lib/types";

const linkKeys: Array<keyof NonNullable<PortfolioEntry["links"]>> = ["github", "demo", "notion", "blog", "etc"];

export function LinkInput({ value, onChange }: { value: PortfolioEntry["links"]; onChange: (value: PortfolioEntry["links"]) => void }) {
  const links = value ?? {};

  return (
    <div className="grid gap-3">
      <p className="text-sm text-slate-300">관련 링크</p>
      <div className="grid gap-3 md:grid-cols-2">
        {linkKeys.map((key) => (
          <label className="grid gap-2 text-sm" key={key}>
            <span className="capitalize text-slate-400">{key}</span>
            <input className="field" onChange={(event) => onChange({ ...links, [key]: event.target.value })} placeholder={`https://${key}.example`} type="url" value={links[key] ?? ""} />
          </label>
        ))}
      </div>
    </div>
  );
}
