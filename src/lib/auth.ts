import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE = "portfolio_user";
export const REGISTERED_USERS_COOKIE = "portfolio_registered_users";

export type PortfolioUser = {
  id: string;
  name: string;
  password: string;
};

function getBaseUsers(): PortfolioUser[] {
  return [
    {
      id: process.env.PORTFOLIO_USER_1_ID ?? "user-a",
      name: process.env.PORTFOLIO_USER_1_NAME ?? "사용자 A",
      password: process.env.PORTFOLIO_USER_1_PASSWORD ?? "green1234"
    },
    {
      id: process.env.PORTFOLIO_USER_2_ID ?? "user-b",
      name: process.env.PORTFOLIO_USER_2_NAME ?? "사용자 B",
      password: process.env.PORTFOLIO_USER_2_PASSWORD ?? "white1234"
    }
  ];
}

export function parseRegisteredUsers(raw?: string): PortfolioUser[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as PortfolioUser[];
    return parsed.filter((user) => user.id && user.name && user.password);
  } catch {
    return [];
  }
}

export function encodeRegisteredUsers(users: PortfolioUser[]) {
  return encodeURIComponent(JSON.stringify(users));
}

export function getPortfolioUsers(registeredRaw?: string): PortfolioUser[] {
  return [...getBaseUsers(), ...parseRegisteredUsers(registeredRaw)];
}

export async function getLoginUsers() {
  const cookieStore = await cookies();
  return getPortfolioUsers(cookieStore.get(REGISTERED_USERS_COOKIE)?.value).map(({ id, name }) => ({ id, name }));
}

export function validatePortfolioLogin(userId: string, password: string, registeredRaw?: string) {
  return getPortfolioUsers(registeredRaw).find((user) => user.id === userId && user.password === password) ?? null;
}

export function createPortfolioUser(name: string, password: string, registeredRaw?: string) {
  const registered = parseRegisteredUsers(registeredRaw);
  const user = {
    id: `user-${randomUUID().slice(0, 8)}`,
    name: name.trim(),
    password
  };
  return { user, users: [...registered, user] };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_COOKIE)?.value;
  return getPortfolioUsers(cookieStore.get(REGISTERED_USERS_COOKIE)?.value).find((user) => user.id === userId) ?? null;
}

export async function requirePortfolioUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
