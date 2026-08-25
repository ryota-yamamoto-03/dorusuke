import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { events, authorName, authorUrl } = await req.json();
  if (!events?.length) {
    return NextResponse.json({ error: "投稿するイベントがありません" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, xUrl: true },
  });

  const results = { success: 0, skipped: 0, errors: [] as string[] };

  for (const event of events) {
    if (!event.liveName || !event.idolName || !event.venue || !event.area) {
      results.skipped++;
      continue;
    }

    // 重複チェック
    const duplicate = await prisma.live.findFirst({ where: { liveName: event.liveName } });
    if (duplicate) {
      results.skipped++;
      continue;
    }

    let parsedDate: Date | null = null;
    if (!event.dateUndecided && event.date) {
      const dateStr = event.time
        ? `${event.date}T${event.time}:00+09:00`
        : `${event.date}T00:00:00+09:00`;
      parsedDate = new Date(dateStr);
    }

    try {
      await prisma.live.create({
        data: {
          liveName: event.liveName,
          idolName: event.idolName,
          date: parsedDate,
          dateUndecided: !!event.dateUndecided,
          venue: event.venue,
          area: event.area,
          link: event.link || "",
          createdBy: session.user.id,
          posterName: user?.name ?? session.user.name,
          posterXUrl: user?.xUrl ?? null,
        },
      });
      results.success++;
    } catch {
      results.errors.push(event.liveName);
    }
  }

  return NextResponse.json(results);
}
