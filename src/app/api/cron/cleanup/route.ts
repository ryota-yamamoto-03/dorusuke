import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Vercel Cron の認証チェック
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const result = await prisma.live.deleteMany({
    where: { date: { lt: now } },
  });

  console.log(`[Cron] 過去ライブ削除: ${result.count}件 (${now.toISOString()})`);

  return NextResponse.json({
    deleted: result.count,
    executedAt: now.toISOString(),
  });
}
