import { NextResponse } from "next/server";
import { AUTH_COOKIE, REGISTERED_USERS_COOKIE, validatePortfolioLogin } from "@/lib/auth";

function readCookie(request: Request, name: string) {
  return (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

export async function POST(request: Request) {
  const { userId, password } = (await request.json()) as { userId?: string; password?: string };
  const user = await validatePortfolioLogin(userId ?? "", password ?? "", readCookie(request, REGISTERED_USERS_COOKIE));

  if (!user) {
    return NextResponse.json({ message: "비밀번호가 맞지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name } });
  response.cookies.set(AUTH_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
  return response;
}
