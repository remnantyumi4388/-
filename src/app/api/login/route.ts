import { NextResponse } from "next/server";
import { AUTH_COOKIE, REGISTERED_USERS_COOKIE, validatePortfolioLogin } from "@/lib/auth";

export async function POST(request: Request) {
  const { userId, password } = (await request.json()) as { userId?: string; password?: string };
  const cookieHeader = request.headers.get("cookie") ?? "";
  const registeredCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REGISTERED_USERS_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  const user = validatePortfolioLogin(userId ?? "", password ?? "", registeredCookie);

  if (!user) {
    return NextResponse.json({ message: "비밀번호가 맞지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
  return response;
}
