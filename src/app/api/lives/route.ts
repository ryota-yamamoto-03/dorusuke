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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { liveName, idolName, date, dateUndecided, venue, area, link } = await req.json();

  if (!liveName || !idolName || !venue || !area || !link) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }
  if (!dateUndecided && !date) {
    return NextResponse.json(
      { error: "日時を入力するか「日時未定」にチェックしてください" },
      { status: 400 }
    );
  }

  // 重複チェック（イベント名だけで弾く）
  const parsedDate = dateUndecided ? null : new Date(date);
  const duplicate = await prisma.live.findFirst({
    where: { liveName },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "重複しています" },
      { status: 409 }
    );
  }

  // ログインユーザーの情報を取得してLiveに直接保存
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, xUrl: true },
  });

  const live = await prisma.live.create({
    data: {
      liveName,
      idolName,
      date: parsedDate,
      dateUndecided: !!dateUndecided,
      venue,
      area,
      link,
      createdBy: session.user.id,
      posterName: user?.name ?? session.user.name,
      posterXUrl: user?.xUrl ?? null,
    },
  });

  return NextResponse.json(live, { status: 201 });
}
