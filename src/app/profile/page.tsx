"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", xUrl: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          setForm({ name: data.name || "", xUrl: data.xUrl || "" });
        });
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="text-center py-20 text-gray-400">読み込み中...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "更新に失敗しました");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👤 プロフィール編集</h1>
          <p className="text-sm text-gray-500 mt-1">{session?.user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl">
              プロフィールを更新しました！
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ニックネーム <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X（Twitter）アカウントURL
            </label>
            <input
              type="url"
              value={form.xUrl}
              onChange={(e) => setForm({ ...form, xUrl: e.target.value })}
              placeholder="https://x.com/yourname"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              設定すると投稿者名がXへのリンクになります
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 text-center border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
            >
              戻る
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "更新中..." : "保存する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
