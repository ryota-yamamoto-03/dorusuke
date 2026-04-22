import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const lives = await prisma.live.findMany({
    select: { venue: true },
    distinct: ["venue"],
    orderBy: { venue: "asc" },
  });

  const names = lives.map((l) => l.venue).filter(Boolean);
  return NextResponse.json(names);
}
