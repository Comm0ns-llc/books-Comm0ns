export default function SearchPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">検索</h1>
      <input className="w-full rounded-md border bg-white px-3 py-2" placeholder="タイトル・著者・ジャンル" />
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">結果はここに表示されます。</div>
    </main>
  );
}
