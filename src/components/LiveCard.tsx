import Link from "next/link";

type Live = {
  id: string;
  liveName: string;
  idolName: string;
  date: string | null;
  dateUndecided: boolean;
  venue: string;
  area: string;
  posterName: string | null;
  posterXUrl: string | null;
};

export default function LiveCard({ live }: { live: Live }) {
  const dateLabel = (() => {
    if (live.dateUndecided || !live.date) return "日時未定";
    const d = new Date(live.date);
    const dateStr = d.toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "short", timeZone: "Asia/Tokyo",
    });
    const timeStr = d.toLocaleTimeString("ja-JP", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo",
    });
    return `${dateStr} ${timeStr}〜`;
  })();

  return (
    <Link href={`/lives/${live.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 hover:shadow-md hover:border-pink-300 transition-all cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-pink-100 text-pink-600 font-medium px-2 py-0.5 rounded-full truncate">
              {live.idolName}
            </span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full whitespace-nowrap">
              {live.area}
            </span>
          </div>
          <h2 className="font-bold text-gray-800 text-base leading-tight truncate">
            {live.liveName}
          </h2>
        </div>

        <div className="mt-3 space-y-1 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>📅</span>
            <span className={live.dateUndecided || !live.date ? "text-pink-400 font-medium" : ""}>
              {dateLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span className="truncate">{live.venue}</span>
          </div>
        </div>

        {live.posterName && (
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5">
            <span>投稿者:</span>
            {live.posterXUrl ? (
              <span
                className="text-sky-500 hover:underline flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(live.posterXUrl!, "_blank", "noopener,noreferrer");
                }}
              >
                𝕏 {live.posterName}
              </span>
            ) : (
              <span>{live.posterName}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
