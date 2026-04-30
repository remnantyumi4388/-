import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <PublicLayout>
      <section className="mx-auto max-w-sm">
        <div className="glass rounded-lg p-6">
          <UserPlus className="text-cyan-200" />
          <h1 className="mt-4 text-3xl font-semibold">회원가입</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">새 계정을 만들면 바로 내 관리자 화면으로 이동합니다.</p>
          <SignupForm />
        </div>
      </section>
    </PublicLayout>
  );
}
