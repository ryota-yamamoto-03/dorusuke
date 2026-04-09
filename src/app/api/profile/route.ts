import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { name, xUrl } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "ニックネームは必須です" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, xUrl: xUrl || null },
    select: { id: true, name: true, email: true, xUrl: true },
  });

  return NextResponse.json(user);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, xUrl: true },
  });

  return NextResponse.json(user);
}
