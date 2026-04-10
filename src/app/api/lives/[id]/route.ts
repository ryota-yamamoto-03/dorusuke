import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const live = await prisma.live.findUnique({ where: { id } });

  if (!live) {
    return NextResponse.json({ error: "ライブが見つかりません" }, { status: 404 });
  }

  const { editToken: _, ...safeData } = live;
  return NextResponse.json(safeData);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const live = await prisma.live.findUnique({ where: { id } });

  if (!live) {
    return NextResponse.json({ error: "ライブが見つかりません" }, { status: 404 });
  }

  const { liveName, idolName, date, dateUndecided, venue, area, link, posterName, xUrl, editToken } =
    await req.json();

  // トークン検証
  if (!editToken || live.editToken !== editToken) {
    return NextResponse.json({ error: "編集権限がありません" }, { status: 403 });
  }

  if (!liveName || !idolName || !venue || !area || !link) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }
  if (!dateUndecided && !date) {
    return NextResponse.json(
      { error: "日時を入力するか「日時未定」にチェックしてください" },
      { status: 400 }
    );
  }

  const updated = await prisma.live.update({
    where: { id },
    data: {
      liveName,
      idolName,
      date: dateUndecided ? null : new Date(date),
      dateUndecided: !!dateUndecided,
      venue,
      area,
      link,
      posterName: posterName || null,
      xUrl: xUrl || null,
    },
  });

  const { editToken: _, ...safeData } = updated;
  return NextResponse.json(safeData);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const live = await prisma.live.findUnique({ where: { id } });

  if (!live) {
    return NextResponse.json({ error: "ライブが見つかりません" }, { status: 404 });
  }

  const { editToken } = await req.json();

  // トークン検証
  if (!editToken || live.editToken !== editToken) {
    return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
  }

  await prisma.live.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
