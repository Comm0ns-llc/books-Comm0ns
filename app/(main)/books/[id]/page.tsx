type Params = { params: Promise<{ id: string }> };

export default async function BookDetailPage({ params }: Params) {
  const { id } = await params;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">本詳細: {id}</h1>
      <section className="rounded-xl border bg-white p-4">
        <p className="text-sm text-slate-700">所有者一覧・感想一覧・貸出リクエストを表示する画面です。</p>
      </section>
    </main>
  );
}
