"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  bookId: string;
};

type Visibility = "public" | "community" | "private";

export default function BookReviewForm({ bookId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [readAt, setReadAt] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("community");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      rating,
      body: body.trim() || undefined,
      readAt: readAt || undefined,
      visibility
    };

    const response = await fetch(`/api/books/${bookId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "感想の投稿に失敗しました。");
      setSubmitting(false);
      return;
    }

    setSuccess("感想を投稿しました。");
    setBody("");
    setReadAt("");
    setVisibility("community");
    setRating(5);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border bg-white p-4">
      <h2 className="text-lg font-semibold">感想を投稿</h2>

      <label className="block space-y-1">
        <span className="text-sm text-slate-700">評価 (1-5)</span>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-28 rounded-md border px-3 py-2"
          required
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-slate-700">感想本文</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={4000}
          className="w-full rounded-md border px-3 py-2"
          placeholder="読んだ感想を書いてください"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm text-slate-700">読了日</span>
          <input
            type="date"
            value={readAt}
            onChange={(e) => setReadAt(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-700">公開範囲</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="community">community</option>
            <option value="public">public</option>
            <option value="private">private</option>
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
