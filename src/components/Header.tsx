"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <span className="text-xl font-bold tracking-wide">ドルスケ</span>
          <span className="text-xs opacity-75 hidden sm:block">アイドルライブ情報投稿サイト</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <Link
                href="/lives/bulk"
                className="bg-white/20 text-white font-bold px-3 py-1.5 rounded-full hover:bg-white/30 transition text-xs hidden sm:block"
              >
                📋 一括投稿
              </Link>
              <Link
                href="/lives/new"
                className="bg-white text-pink-600 font-bold px-4 py-1.5 rounded-full hover:bg-pink-50 transition"
              >
                ＋ 投稿
              </Link>
              <span className="opacity-75 hidden sm:block">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="opacity-75 hover:opacity-100 transition text-xs"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:opacity-75 transition">
                ログイン
              </Link>
              <Link
                href="/register"
                className="bg-white text-pink-600 font-bold px-4 py-1.5 rounded-full hover:bg-pink-50 transition"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
