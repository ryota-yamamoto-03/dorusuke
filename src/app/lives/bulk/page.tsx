"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AREAS = ["東京", "横浜", "大阪", "名古屋", "福岡", "札幌", "その他"];

type Event = {
  liveName: string;
  idolName: string;
  date: string | null;
  time: string | null;
  venue: string;
  area: string;
  link: string;
  dateUndecided: boolean;
  isFuture: boolean;
  selected: boolean;
};

export default function BulkPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [xHandle, setXHandle] = useState("");
  const [urlsText, setUrlsText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [parseError, setParseError] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");
  const [result, setResult] = useState<{ success: number; skipped: number } | null>(null);

  if (status === "loading") return <div className="text-center py-20 text-gray-400">読み込み中...</div>;
  if (!session) return (
    <div className="text-center py-20">
      <p className="text-gray-600 mb-4">ログインが必要です</p>
      <Link href="/login" className="text-pink-500 underline">ログイン</Link>
    </div>
  );

  const handleParse = async () => {
    const urls = urlsText.split(/[\n\s,]+/).map(u => u.trim()).filter(u => u.includes("x.com") || u.includes("twitter.com"));
    if (!urls.length) { setParseError("有効なXのURLが見つかりません"); return; }
    setParsing(true);
    setParseError("");
    setEvents([]);
    setResult(null);

    const res = await fetch("/api/parse-tweets-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweetUrls: urls }),
    });
    const data = await res.json();
    if (!res.ok) { setParseError(data.error || "解析に失敗しました"); setParsing(false); return; }

    setAuthorName(data.authorName);
    setAuthorUrl(data.authorUrl);
    setEvents((data.events as Event[]).map(e => ({ ...e, selected: true })));
    setParsing(false);
  };

  const handlePost = async () => {
    const selected = events.filter(e => e.selected);
    if (!selected.length) return;
    setPosting(true);

    const res = await fetch("/api/lives/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: selected, authorName, authorUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data);
      setEvents([]);
      setUrlsText("");
    }
    setPosting(false);
  };

  const toggleAll = (val: boolean) => setEvents(events.map(e => ({ ...e, selected: val })));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📋 ライブ情報を一括投稿</h1>
          <p className="text-sm text-gray-500 mt-1">アイドルのXアカウントのライブ告知ツイートURLを貼り付けると、AIが未来のライブ情報を一括で登録します</p>
        </div>

        {/* Step 1 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            アイドルのXアカウント（任意・表示用）
          </label>
          <input type="text" value={xHandle} onChange={e => setXHandle(e.target.value)}
            placeholder="例：@idol_official"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
        </div>

        {/* Step 2 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ライブ告知ツイートのURL <span className="text-pink-500">*</span>
            <span className="text-gray-400 font-normal ml-1">（複数可・1行1URL または スペース区切り・最大20件）</span>
          </label>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2 text-xs text-blue-600">
            💡 アイドルのXプロフィールを開き、ライブ告知ツイートを右クリック →「ポストのリンクをコピー」でURLを取得できます
          </div>
          <textarea value={urlsText} onChange={e => setUrlsText(e.target.value)} rows={6}
            placeholder={"https://x.com/idol_name/status/123456789\nhttps://x.com/idol_name/status/987654321\n..."}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 resize-none" />
        </div>

        {parseError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{parseError}</div>}

        <button onClick={handleParse} disabled={parsing || !urlsText.trim()}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 mb-6">
          {parsing ? "🤖 AIが解析中..." : "🤖 AIで解析する"}
        </button>

        {/* 解析結果 */}
        {events.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-700">📋 未来のライブ情報（{events.length}件）</h2>
              <div className="flex gap-2 text-xs">
                <button onClick={() => toggleAll(true)} className="text-pink-500 hover:underline">全選択</button>
                <button onClick={() => toggleAll(false)} className="text-gray-400 hover:underline">全解除</button>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {events.map((ev, i) => (
                <div key={i} onClick={() => setEvents(events.map((e, j) => j === i ? { ...e, selected: !e.selected } : e))}
                  className={`border rounded-xl p-4 cursor-pointer transition ${ev.selected ? "border-pink-300 bg-pink-50" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={ev.selected} readOnly
                      className="mt-0.5 w-4 h-4 accent-pink-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">{ev.idolName}</span>
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{ev.area}</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{ev.liveName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {ev.dateUndecided ? "日時未定" : ev.date ? `${ev.date}${ev.time ? " " + ev.time : ""}` : "不明"}
                        {ev.venue && <> 　📍 {ev.venue}</>}
                      </p>

                      {/* インライン編集 */}
                      <div className="mt-2 grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                        <input value={ev.liveName} onChange={e => setEvents(events.map((ev2, j) => j === i ? { ...ev2, liveName: e.target.value } : ev2))}
                          className="col-span-2 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400"
                          placeholder="ライブ名" />
                        <input value={ev.idolName} onChange={e => setEvents(events.map((ev2, j) => j === i ? { ...ev2, idolName: e.target.value } : ev2))}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400"
                          placeholder="アイドル名" />
                        <input value={ev.venue} onChange={e => setEvents(events.map((ev2, j) => j === i ? { ...ev2, venue: e.target.value } : ev2))}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400"
                          placeholder="会場" />
                        <input value={ev.date ?? ""} onChange={e => setEvents(events.map((ev2, j) => j === i ? { ...ev2, date: e.target.value } : ev2))}
                          type="date" className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400" />
                        <input value={ev.time ?? ""} onChange={e => setEvents(events.map((ev2, j) => j === i ? { ...ev2, time: e.target.value } : ev2))}
                          type="time" className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400" />
                        <select value={ev.area} onChange={e => setEvents(events.map((ev2, j) => j === i ? { ...ev2, area: e.target.value } : ev2))}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400 bg-white">
                          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <input value={ev.link} onChange={e => setEvents(events.map((ev2, j) => j === i ? { ...ev2, link: e.target.value } : ev2))}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400"
                          placeholder="詳細URL" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handlePost} disabled={posting || !events.some(e => e.selected)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
              {posting ? "投稿中..." : `✅ 選択した${events.filter(e => e.selected).length}件を一括投稿する`}
            </button>
          </div>
        )}

        {/* 完了メッセージ */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-bold text-lg">🎉 投稿完了！</p>
            <p className="text-green-600 text-sm mt-1">{result.success}件を投稿しました（{result.skipped}件は重複スキップ）</p>
            <Link href="/" className="mt-3 inline-block text-pink-500 underline text-sm">一覧を見る</Link>
          </div>
        )}
      </div>
    </div>
  );
}
