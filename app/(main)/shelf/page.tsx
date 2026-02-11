import Link from "next/link";
import { getSupabaseForRequest } from "@/lib/supabase";

export default async function ShelfPage() {
  const supabase = await getSupabaseForRequest();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="space-y-4">
        <h1 className="text-xl font-bold">マイ本棚</h1>
        <p className="rounded-xl border bg-white p-4 text-sm text-slate-700">
          本棚を表示するにはログインが必要です。
        </p>
      </main>
    );
  }

  const { data: books } = await supabase
    .from("user_books")
    .select("id, status, books!inner(id, title, author)")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">マイ本棚</h1>
      <button className="rounded-md bg-teal-700 px-3 py-2 text-sm text-white">ISBNで本を追加</button>

      <div className="grid gap-3 sm:grid-cols-2">
        {(books ?? []).map((row) => {
          const book = Array.isArray(row.books) ? row.books[0] : row.books;
          return (
            <article key={row.id} className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">{book?.title ?? "タイトル不明"}</h2>
              <p className="text-sm text-slate-600">著者: {book?.author ?? "不明"}</p>
              <p className="text-sm text-slate-600">status: {row.status}</p>
              {book?.id && (
                <Link href={`/books/${book.id}`} className="mt-2 inline-block text-sm font-medium text-teal-700 underline">
                  本詳細を見る
                </Link>
              )}
            </article>
          );
        })}

        {(books ?? []).length === 0 && (
          <p className="rounded-xl border bg-white p-4 text-sm text-slate-600">まだ本棚に本がありません。</p>
        )}
      </div>
    </main>
  );
}
