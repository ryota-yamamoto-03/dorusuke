import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idolName = searchParams.get("idolName");
  const area = searchParams.get("area");
  const date = searchParams.get("date"); // YYYY-MM-DD

  try {
    const lives = await prisma.live.findMany({
      where: {
        ...(idolName ? { idolName: { contains: idolName } } : {}),
        ...(area ? { area } : {}),
        ...(date
          ? {
              date: {
                gte: new Date(`${date}T00:00:00.000Z`),
                lt: new Date(`${date}T23:59:59.999Z`),
              },
            }
          : {}),
      },
      include: { user: { select: { name: true, xUrl: true } } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(lives);
  } catch (e) {
    console.error("GET /api/lives error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
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
