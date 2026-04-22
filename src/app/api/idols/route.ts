import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const lives = await prisma.live.findMany({
    select: { idolName: true },
  });

  // 区切り文字で分割して個別のアイドル名に展開・重複除去・ソート
  const separators = /[、・,\/／\n]+/;
  const nameSet = new Set<string>();

  for (const { idolName } of lives) {
    if (!idolName) continue;
    const parts = idolName.split(separators);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) nameSet.add(trimmed);
    }
  }

  const names = Array.from(nameSet).sort((a, b) => a.localeCompare(b, "ja"));
  return NextResponse.json(names);
}
