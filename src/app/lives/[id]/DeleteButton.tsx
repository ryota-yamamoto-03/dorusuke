"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ liveId }: { liveId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/lives/${liveId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex-1 flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
        >
          キャンセル
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition text-sm font-bold disabled:opacity-50"
        >
          {loading ? "削除中..." : "本当に削除"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex-1 border border-red-200 text-red-500 py-2.5 rounded-xl hover:bg-red-50 transition text-sm font-medium"
    >
      🗑️ 削除
    </button>
  );
}
