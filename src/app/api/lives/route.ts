import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idolName = searchParams.get("idolName");
  const area = searchParams.get("area");

  const lives = await prisma.live.findMany({
    where: {
      ...(idolName ? { idolName: { contains: idolName } } : {}),
      ...(area ? { area } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(lives);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { liveName, idolName, date, venue, area, link } = await req.json();

  if (!liveName || !idolName || !date || !venue || !area || !link) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  const live = await prisma.live.create({
    data: {
      liveName,
      idolName,
      date: new Date(date),
      venue,
      area,
      link,
      createdBy: session.user.id,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(live, { status: 201 });
}
