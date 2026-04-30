import { NextResponse } from "next/server";
import { AUTH_COOKIE, REGISTERED_USERS_COOKIE, createPortfolioUser, encodeRegisteredUsers } from "@/lib/auth";

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
  const { name, password } = (await request.json()) as { name?: string; password?: string };

  if (!name?.trim() || !password || password.length < 4) {
    return NextResponse.json({ message: "이름과 4자리 이상 비밀번호를 입력하세요." }, { status: 400 });
  }

  const { user, users, storedInDatabase } = await createPortfolioUser(name, password, readCookie(request, REGISTERED_USERS_COOKIE));
  const response = NextResponse.json({ ok: true, storedInDatabase, user: { id: user.id, name: user.name } });

  if (!storedInDatabase) {
    response.cookies.set(REGISTERED_USERS_COOKIE, encodeRegisteredUsers(users), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/"
    });
  }

  response.cookies.set(AUTH_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/"
  });

  return response;
}
