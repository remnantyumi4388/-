"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password })
    });

    setIsLoading(false);
    if (!response.ok) {
      setError("이름과 4자리 이상 비밀번호를 입력해 주세요.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <input className="field" onChange={(event) => setName(event.target.value)} placeholder="이름" value={name} />
      <input className="field" onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호 4자리 이상" type="password" value={password} />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 font-semibold text-slate-950 hover:bg-cyan-200" disabled={isLoading} type="submit">
        <UserPlus size={17} />
        {isLoading ? "가입 중" : "회원가입"}
      </button>
      <Link className="text-center text-sm text-cyan-200 hover:text-white" href="/login">
        이미 계정이 있어요
      </Link>
    </form>
  );
}
