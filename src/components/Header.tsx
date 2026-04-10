import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <span className="text-xl font-bold tracking-wide">ドルスケ</span>
          <span className="text-xs opacity-75 hidden sm:block">アイドルライブ情報投稿サイト</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/lives/new"
            className="bg-white text-pink-600 font-bold px-4 py-1.5 rounded-full hover:bg-pink-50 transition"
          >
            ＋ 投稿
          </Link>
        </nav>
      </div>
    </header>
  );
}
