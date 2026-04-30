import { NextResponse } from "next/server";
import { createEntryForOwner, getAllEntriesForAdmin, type EntryPayload } from "@/lib/data";
import { requirePortfolioUser } from "@/lib/auth";
import { hasSupabaseAdminConfig } from "@/lib/supabaseAdmin";

export async function GET() {
  const user = await requirePortfolioUser();
  const entries = await getAllEntriesForAdmin(user.id);
  return NextResponse.json({ entries, database: hasSupabaseAdminConfig() });
}

export async function POST(request: Request) {
  const user = await requirePortfolioUser();
  const payload = (await request.json()) as EntryPayload;

  if (!payload.title?.trim() || !payload.finalDate || !payload.type) {
    return NextResponse.json({ message: "필수 값이 부족합니다." }, { status: 400 });
  }

  const entry = await createEntryForOwner(user.id, payload);
  if (!entry) {
    return NextResponse.json({ message: "Supabase 저장소가 아직 연결되지 않았습니다." }, { status: 503 });
  }

  return NextResponse.json({ entry });
}
