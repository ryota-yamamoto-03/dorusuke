"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, xUrl }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "登録に失敗しました");
      setLoading(false);
      return;
    }

    // 登録後に自動ログイン
    await signIn("credentials", { email, password, redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">✨</div>
          <h1 className="text-2xl font-bold text-gray-800">新規登録</h1>
          <p className="text-sm text-gray-500 mt-1">ドルスケへようこそ！</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ニックネーム
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
              placeholder="推し活ネーム"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
              placeholder="6文字以上"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X（Twitter）アカウントURL（任意）
            </label>
            <input
              type="url"
              value={xUrl}
              onChange={(e) => setXUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
              placeholder="https://x.com/yourname"
            />
            <p className="text-xs text-gray-400 mt-1">後から設定もできます</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "登録中..." : "アカウント作成"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-pink-500 font-medium hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
