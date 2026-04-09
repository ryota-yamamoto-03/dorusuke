import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const live = await prisma.live.findUnique({
    where: { id },
    include: { user: { select: { name: true, xUrl: true } } },
  });

  if (!live) {
    return NextResponse.json({ error: "ライブが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(live);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const live = await prisma.live.findUnique({ where: { id } });

  if (!live) {
    return NextResponse.json({ error: "ライブが見つかりません" }, { status: 404 });
  }
  if (live.createdBy !== session.user.id) {
    return NextResponse.json({ error: "編集権限がありません" }, { status: 403 });
  }

  const { liveName, idolName, date, venue, area, link } = await req.json();

  if (!liveName || !idolName || !date || !venue || !area || !link) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  const updated = await prisma.live.update({
    where: { id },
    data: { liveName, idolName, date: new Date(date), venue, area, link },
    include: { user: { select: { name: true, xUrl: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { id } = await params;
  const live = await prisma.live.findUnique({ where: { id } });

  if (!live) {
    return NextResponse.json({ error: "ライブが見つかりません" }, { status: 404 });
  }
  if (live.createdBy !== session.user.id) {
    return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
  }

  await prisma.live.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
