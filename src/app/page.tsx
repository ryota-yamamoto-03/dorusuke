"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LiveCard from "@/components/LiveCard";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Live = {
  id: string;
  liveName: string;
  idolName: string;
  date: string | null;
  dateUndecided: boolean;
  venue: string;
  area: string;
  link: string | null;
  posterName: string | null;
  posterXUrl: string | null;
};

const AREAS = ["東京", "大阪", "名古屋", "福岡", "札幌", "その他"];

function HomeContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchIdol, setSearchIdol] = useState(searchParams.get("idolName") ?? "");
  const [filterArea, setFilterArea] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [allIdolNames, setAllIdolNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch("/api/idols").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setAllIdolNames(data);
    });
  }, []);

  const fetchLives = async (idol: string, area: string, date: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (idol) params.set("idolName", idol);
    if (area) params.set("area", area);
    if (date) params.set("date", date);
    const res = await fetch(`/api/lives?${params}`);
    const data = await res.json();
    setLives(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLives(searchIdol, filterArea, filterDate);
  }, [searchIdol, filterArea, filterDate]);

  const hasFilter = searchIdol || filterArea || filterDate;

  return (
    <div>
      {/* ヒーローセクション */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎤 推しのライブを見逃さない
        </h1>
        <p className="text-gray-500 text-sm">
          アイドルのライブ情報をみんなで共有しよう
        </p>
        {!session && (
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/register"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold hover:opacity-90 transition"
            >
              無料で始める
            </Link>
            <Link
              href="/login"
              className="border border-pink-300 text-pink-600 px-6 py-2 rounded-full font-medium hover:bg-pink-50 transition"
            >
              ログイン
            </Link>
          </div>
        )}
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* アイドル名検索 */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="🔍 アイドル名で検索..."
                value={searchIdol}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchIdol(v);
                  if (v.trim() === "") {
                    setSuggestions([]);
                    setShowSuggestions(false);
                  } else {
                    const filtered = allIdolNames.filter((n) =>
                      n.toLowerCase().includes(v.toLowerCase())
                    ).slice(0, 8);
                    setSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                autoComplete="off"
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400"
              />
              {showSuggestions && (
                <ul className="absolute z-10 w-full bg-white border border-pink-200 rounded-2xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {suggestions.map((name) => (
                    <li
                      key={name}
                      onMouseDown={() => {
                        setSearchIdol(name);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 cursor-pointer first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* エリアフィルター */}
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400 bg-white"
            >
              <option value="">エリア: すべて</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* 日付カレンダー */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">
                📅
              </span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-pink-400 bg-white text-gray-700"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="shrink-0 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full"
              >
                クリア
              </button>
            )}
            {hasFilter && (
              <button
                onClick={() => {
                  setSearchIdol("");
                  setFilterArea("");
                  setFilterDate("");
                }}
                className="shrink-0 text-xs text-pink-400 hover:text-pink-600"
              >
                全クリア
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ライブ一覧 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-2">🎵</div>
          <p>読み込み中...</p>
        </div>
      ) : lives.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-2">🎤</div>
          <p className="mb-4">
            {hasFilter ? "該当するライブが見つかりません" : "まだライブ情報がありません"}
          </p>
          {session && !hasFilter && (
            <Link
              href="/lives/new"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold hover:opacity-90 transition"
            >
              最初の投稿をする
            </Link>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-400 mb-3">{lives.length}件のライブ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lives.map((live) => (
              <LiveCard key={live.id} live={live} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">読み込み中...</div>}>
      <HomeContent />
    </Suspense>
  );
}
