"use client";

import { FormEvent, useEffect, useState } from "react";

type PlaceRow = {
  role: "admin" | "member";
  place: {
    id: string;
    name: string;
    type: "home" | "share_house" | "office" | "community_space" | "other";
    area: string | null;
    description: string | null;
  } | null;
};

const PLACE_TYPES = [
  { value: "home", label: "自宅" },
  { value: "share_house", label: "シェアハウス" },
  { value: "office", label: "オフィス" },
  { value: "community_space", label: "コミュニティスペース" },
  { value: "other", label: "その他" }
] as const;

export default function PlacesPage() {
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof PLACE_TYPES)[number]["value"]>("other");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadPlaces() {
    const response = await fetch("/api/places", { cache: "no-store" });
    const json = (await response.json()) as { data?: PlaceRow[]; error?: string };
    if (!response.ok) {
      setError(json.error ?? "場所一覧の取得に失敗しました。");
      return;
    }
    setPlaces((json.data ?? []).filter((row) => row.place));
  }

  useEffect(() => {
    void loadPlaces();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        area: area.trim() || undefined,
        description: description.trim() || undefined
      })
    });

    const json = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(json?.error ?? "場所の作成に失敗しました。");
      return;
    }

    setSuccess("場所を作成しました。");
    setName("");
    setArea("");
    setDescription("");
    await loadPlaces();
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <section className="rounded-xl border bg-white p-4">
        <h1 className="text-xl font-bold">場所管理</h1>
        <p className="mt-1 text-sm text-slate-600">本の物理的な所在地として使う場所を管理します。</p>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">場所を作成</h2>
        <form className="mt-3 space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="場所名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select className="w-full rounded-md border px-3 py-2" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {PLACE_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="エリア（任意）"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border px-3 py-2"
            rows={3}
            placeholder="説明（任意）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">
            作成する
          </button>
        </form>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">所属している場所</h2>
        <div className="mt-3 space-y-2">
          {places.length === 0 && <p className="text-sm text-slate-600">まだ場所に所属していません。</p>}
          {places.map((row) => (
            <div key={row.place?.id} className="rounded-lg border p-3">
              <p className="font-medium">{row.place?.name}</p>
              <p className="text-sm text-slate-600">
                種類: {row.place?.type} / 役割: {row.role}
              </p>
              {row.place?.area && <p className="text-sm text-slate-600">エリア: {row.place.area}</p>}
              {row.place?.description && <p className="text-sm text-slate-600">{row.place.description}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
