import { NextRequest, NextResponse } from "next/server";
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
                gte: new Date(`${date}T00:00:00.000+09:00`),
                lt:  new Date(`${date}T23:59:59.999+09:00`),
              },
            }
          : {}),
      },
      orderBy: [{ dateUndecided: "asc" }, { date: "asc" }],
    });
    return NextResponse.json(lives);
  } catch (e) {
    console.error("GET /api/lives error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { liveName, idolName, date, dateUndecided, venue, area, link, posterName, xUrl } =
    await req.json();

  if (!liveName || !idolName || !venue || !area || !link) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }
  if (!dateUndecided && !date) {
    return NextResponse.json(
      { error: "日時を入力するか「日時未定」にチェックしてください" },
      { status: 400 }
    );
  }

  const live = await prisma.live.create({
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

  return NextResponse.json(live, { status: 201 });
}
