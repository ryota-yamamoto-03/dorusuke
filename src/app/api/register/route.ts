import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password, xUrl } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "全項目を入力してください" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, xUrl: xUrl || null },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
