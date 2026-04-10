"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditDeleteButtons({ liveId }: { liveId: string }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("dorusuke_tokens") || "{}");
    if (stored[liveId]) setToken(stored[liveId]);
  }, [liveId]);

  if (!token) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/lives/${liveId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editToken: token }),
    });

    if (res.ok) {
      // トークンを削除
      const stored = JSON.parse(localStorage.getItem("dorusuke_tokens") || "{}");
      delete stored[liveId];
      localStorage.setItem("dorusuke_tokens", JSON.stringify(stored));
      router.push("/");
      router.refresh();
    } else {
      setDeleting(false);
      setShowConfirm(false);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="pt-4 border-t border-gray-100 flex gap-3">
      <Link
        href={`/lives/${liveId}/edit`}
        className="flex-1 text-center border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
      >
        ✏️ 編集
      </Link>

      {showConfirm ? (
        <div className="flex-1 flex gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition text-sm font-medium disabled:opacity-50"
          >
            {deleting ? "削除中..." : "削除する"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 border border-red-200 text-red-500 py-2.5 rounded-xl hover:bg-red-50 transition text-sm font-medium"
        >
          🗑️ 削除
        </button>
      )}
    </div>
  );
}
