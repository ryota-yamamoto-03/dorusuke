"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const AREAS = ["東京", "横浜", "大阪", "名古屋", "福岡", "札幌", "その他"];

export default function EditLivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const liveId = params.id as string;

  const [form, setForm] = useState({
    liveName: "",
    idolName: "",
    date: "",
    venue: "",
    area: "",
    link: "",
  });
  const [dateUndecided, setDateUndecided] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!liveId) return;
    fetch(`/api/lives/${liveId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setDateUndecided(!!data.dateUndecided);
        let localDate = "";
        if (!data.dateUndecided && data.date) {
          const d = new Date(data.date);
          const jstDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
          localDate = jstDate.toISOString().slice(0, 16);
        }
        setForm({
          liveName: data.liveName,
          idolName: data.idolName,
          date: localDate,
          venue: data.venue,
          area: data.area,
          link: data.link || "",
        });
        setFetching(false);
      });
  }, [liveId]);

  if (status === "loading" || fetching) {
    return <div className="text-center py-20 text-gray-400">読み込み中...</div>;
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 mb-4">ログインが必要です</p>
        <Link href="/login" className="text-pink-500 underline">ログイン</Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/lives/${liveId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        date: form.date ? form.date + "+09:00" : "",
        dateUndecided,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "更新に失敗しました");
      setLoading(false);
      return;
    }

    router.push(`/lives/${liveId}`);
    router.refresh();
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">✏️ ライブを編集</h1>
          <p className="text-sm text-gray-500 mt-1">投稿内容を更新します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ライブ名 <span className="text-pink-500">*</span>
            </label>
            <input type="text" name="liveName" value={form.liveName} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アイドル名 <span className="text-pink-500">*</span>
            </label>
            <input type="text" name="idolName" value={form.idolName} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                日時 {!dateUndecided && <span className="text-pink-500">*</span>}
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={dateUndecided}
                  onChange={(e) => { setDateUndecided(e.target.checked); if (e.target.checked) setForm({ ...form, date: "" }); }}
                  className="w-4 h-4 accent-pink-500" />
                <span className="text-sm text-gray-500">📋 日時未定</span>
              </label>
            </div>
            {dateUndecided ? (
              <div className="w-full border border-dashed border-pink-300 bg-pink-50 rounded-xl px-4 py-2.5 text-sm text-pink-400 text-center">日時未定</div>
            ) : (
              <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required={!dateUndecided}
                className="w-full max-w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会場 <span className="text-pink-500">*</span>
            </label>
            <input type="text" name="venue" value={form.venue} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              エリア <span className="text-pink-500">*</span>
            </label>
            <select name="area" value={form.area} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 bg-white">
              <option value="">選択してください</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ライブ詳細URL <span className="text-pink-500">*</span>
            </label>
            <input type="url" name="link" value={form.link} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
              placeholder="https://..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href={`/lives/${liveId}`}
              className="flex-1 text-center border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
              キャンセル
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
              {loading ? "更新中..." : "更新する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
