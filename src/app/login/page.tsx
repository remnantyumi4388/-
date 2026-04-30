import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser, getLoginUsers } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <PublicLayout>
      <section className="mx-auto max-w-sm">
        <div className="glass rounded-lg p-6">
          <LockKeyhole className="text-cyan-200" />
          <h1 className="mt-4 text-3xl font-semibold">로그인</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">각자 계정으로 들어가서 자기 기록만 관리합니다.</p>
          <LoginForm users={await getLoginUsers()} />
        </div>
      </section>
    </PublicLayout>
  );
}
