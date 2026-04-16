import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const lives = await prisma.live.findMany({
    select: { idolName: true },
    distinct: ["idolName"],
    orderBy: { idolName: "asc" },
  });

  const names = lives.map((l) => l.idolName).filter(Boolean);
  return NextResponse.json(names);
}
