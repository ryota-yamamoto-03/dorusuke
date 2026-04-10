import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const live = await prisma.live.findUnique({ where: { id } });

  if (!live) notFound();

  const dateLabel = (() => {
    if (live.dateUndecided || !live.date) return "日時未定";
    const d = new Date(live.date);
    const dateStr = d.toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "long", timeZone: "Asia/Tokyo",
    });
    const timeStr = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" });
    return `${dateStr} ${timeStr}〜`;
  })();

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4"
      >
        ← 一覧に戻る
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {live.idolName}
            </span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {live.area}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{live.liveName}</h1>
        </div>

        {/* 詳細情報 */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">日時</p>
              <p className={`font-medium ${live.dateUndecided || !live.date ? "text-pink-400" : "text-gray-800"}`}>
                {dateLabel}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">会場</p>
              <p className="text-gray-800 font-medium">{live.venue}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">🗾</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">エリア</p>
              <p className="text-gray-800 font-medium">{live.area}</p>
            </div>
          </div>

          {live.posterName && (
            <div className="flex items-start gap-3">
              <span className="text-xl">👤</span>
              <div>
                <p className="text-xs text-gray-400 font-medium">投稿者</p>
                {live.xUrl ? (
                  <a
                    href={live.xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-500 hover:underline font-medium flex items-center gap-1"
                  >
                    𝕏 {live.posterName}
                  </a>
                ) : (
                  <p className="text-gray-800 font-medium">{live.posterName}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="text-xl">🕐</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">投稿日</p>
              <p className="text-gray-800 font-medium">
                {live.createdAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}
              </p>
            </div>
          </div>

          {/* 外部リンクボタン */}
          {live.link && (
            <div className="pt-4 border-t border-gray-100">
              <a
                href={live.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
              >
                🎫 ライブ詳細
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
