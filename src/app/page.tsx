"use client";

import { useEffect, useState } from "react";
import LiveCard from "@/components/LiveCard";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Live = {
  id: string;
  liveName: string;
  idolName: string;
  date: string;
  venue: string;
  area: string;
  link: string | null;
  user: { name: string };
};

const AREAS = ["東京", "大阪", "名古屋", "福岡", "札幌", "仙台", "その他"];

export default function HomePage() {
  const { data: session } = useSession();
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchIdol, setSearchIdol] = useState("");
  const [filterArea, setFilterArea] = useState("");

  const fetchLives = async (idol: string, area: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (idol) params.set("idolName", idol);
    if (area) params.set("area", area);
    const res = await fetch(`/api/lives?${params}`);
    const data = await res.json();
    setLives(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLives(searchIdol, filterArea);
  }, [searchIdol, filterArea]);

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
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 アイドル名で検索..."
          value={searchIdol}
          onChange={(e) => setSearchIdol(e.target.value)}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400"
        />
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400 bg-white"
        >
          <option value="">エリア: すべて</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {(searchIdol || filterArea) && (
          <button
            onClick={() => {
              setSearchIdol("");
              setFilterArea("");
            }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            クリア
          </button>
        )}
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
          <p className="mb-4">まだライブ情報がありません</p>
          {session && (
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
