"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";

export function LoginForm({ users }: { users: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password })
    });

    setIsLoading(false);
    if (!response.ok) {
      setError("비밀번호를 다시 확인해 주세요.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <select className="field" value={userId} onChange={(event) => setUserId(event.target.value)}>
        {users.map((user) => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
      <input className="field" onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호" type="password" value={password} />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 font-semibold text-slate-950 hover:bg-cyan-200" disabled={isLoading} type="submit">
        <LogIn size={17} />
        {isLoading ? "확인 중" : "로그인"}
      </button>
      <Link className="text-center text-sm text-cyan-200 hover:text-white" href="/signup">
        계정 만들기
      </Link>
    </form>
  );
}
