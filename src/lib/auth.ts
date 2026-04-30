import { createHash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabaseAdmin";

export const AUTH_COOKIE = "portfolio_user";
export const REGISTERED_USERS_COOKIE = "portfolio_registered_users";

export type PortfolioUser = {
  id: string;
  name: string;
  password?: string;
  passwordHash?: string;
};

type DbUser = {
  id: string;
  name: string;
  password_hash: string;
};

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

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
    return parsed.filter((user) => user.id && user.name && (user.password || user.passwordHash));
  } catch {
    return [];
  }
}

export function encodeRegisteredUsers(users: PortfolioUser[]) {
  return encodeURIComponent(JSON.stringify(users));
}

async function getDatabaseUsers(): Promise<PortfolioUser[]> {
  if (!hasSupabaseAdminConfig()) return [];
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("portfolio_users").select("id,name,password_hash").order("created_at", { ascending: true });
  if (error || !data) return [];

  return (data as DbUser[]).map((user) => ({
    id: user.id,
    name: user.name,
    passwordHash: user.password_hash
  }));
}

export async function getPortfolioUsers(registeredRaw?: string): Promise<PortfolioUser[]> {
  const dbUsers = await getDatabaseUsers();
  return [...getBaseUsers(), ...parseRegisteredUsers(registeredRaw), ...dbUsers];
}

export async function getLoginUsers() {
  const cookieStore = await cookies();
  const users = await getPortfolioUsers(cookieStore.get(REGISTERED_USERS_COOKIE)?.value);
  const unique = new Map(users.map((user) => [user.id, { id: user.id, name: user.name }]));
  return Array.from(unique.values());
}

export async function validatePortfolioLogin(userId: string, password: string, registeredRaw?: string) {
  const users = await getPortfolioUsers(registeredRaw);
  const passwordHash = hashPassword(password);
  return users.find((user) => user.id === userId && (user.password === password || user.passwordHash === passwordHash)) ?? null;
}

export async function createPortfolioUser(name: string, password: string, registeredRaw?: string) {
  const user = {
    id: `user-${randomUUID().slice(0, 8)}`,
    name: name.trim(),
    passwordHash: hashPassword(password)
  };

  if (hasSupabaseAdminConfig()) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase.from("portfolio_users").insert({
        id: user.id,
        name: user.name,
        password_hash: user.passwordHash
      });
      if (!error) return { user, users: parseRegisteredUsers(registeredRaw), storedInDatabase: true };
    }
  }

  const registered = parseRegisteredUsers(registeredRaw);
  return { user, users: [...registered, user], storedInDatabase: false };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_COOKIE)?.value;
  const users = await getPortfolioUsers(cookieStore.get(REGISTERED_USERS_COOKIE)?.value);
  return users.find((user) => user.id === userId) ?? null;
}

export async function requirePortfolioUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
