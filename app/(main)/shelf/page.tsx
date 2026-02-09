export default function ShelfPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">マイ本棚</h1>
      <button className="rounded-md bg-teal-700 px-3 py-2 text-sm text-white">ISBNで本を追加</button>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">ダミー書籍</h2>
          <p className="text-sm text-slate-600">status: available</p>
        </article>
      </div>
    </main>
  );
}
