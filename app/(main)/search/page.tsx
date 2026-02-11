import Link from "next/link";
import { getSupabaseForRequest } from "@/lib/supabase";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const supabase = await getSupabaseForRequest();

  const { data: results } = query
    ? await supabase
        .from("books")
        .select("id, title, author, isbn")
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(30)
    : { data: [] };

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">検索</h1>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          className="w-full rounded-md border bg-white px-3 py-2"
          placeholder="タイトル・著者で検索"
        />
        <button type="submit" className="rounded-md bg-teal-700 px-4 py-2 text-sm text-white">
          検索
        </button>
      </form>

      {!query && <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">キーワードを入れて検索してください。</div>}

      {query && (
        <div className="space-y-3">
          {(results ?? []).map((book) => (
            <article key={book.id} className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">{book.title}</h2>
              <p className="text-sm text-slate-600">著者: {book.author ?? "不明"}</p>
              <p className="text-sm text-slate-600">ISBN: {book.isbn ?? "未登録"}</p>
              <Link href={`/books/${book.id}`} className="mt-2 inline-block text-sm font-medium text-teal-700 underline">
                本詳細を見る
              </Link>
            </article>
          ))}
          {(results ?? []).length === 0 && (
            <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">該当する本が見つかりませんでした。</div>
          )}
        </div>
      )}
    </main>
  );
}
