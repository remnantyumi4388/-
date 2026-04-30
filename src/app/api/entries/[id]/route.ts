import { NextResponse } from "next/server";
import { deleteEntryForOwner, updateEntryForOwner, type EntryPayload } from "@/lib/data";
import { requirePortfolioUser } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortfolioUser();
  const { id } = await params;
  const payload = (await request.json()) as EntryPayload;

  const entry = await updateEntryForOwner(user.id, id, payload);
  if (!entry) {
    return NextResponse.json({ message: "수정할 수 없습니다." }, { status: 503 });
  }

  return NextResponse.json({ entry });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortfolioUser();
  const { id } = await params;
  const ok = await deleteEntryForOwner(user.id, id);

  if (!ok) {
    return NextResponse.json({ message: "삭제할 수 없습니다." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
