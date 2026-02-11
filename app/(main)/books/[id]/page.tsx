import { notFound } from "next/navigation";
import BookReviewForm from "@/components/book-review-form";
import { getSupabaseForRequest } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

type ReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  read_at: string | null;
  visibility: "public" | "community" | "private";
  created_at: string;
  users: { id: string; display_name: string } | { id: string; display_name: string }[] | null;
};

export default async function BookDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseForRequest();

  const [bookRes, reviewsRes] = await Promise.all([
    supabase.from("books").select("id, title, author, isbn").eq("id", id).single(),
    supabase
      .from("reviews")
      .select("id, rating, body, read_at, visibility, created_at, users!inner(id, display_name)")
      .eq("book_id", id)
      .order("created_at", { ascending: false })
  ]);

  if (bookRes.error || !bookRes.data) notFound();

  const reviews = (reviewsRes.data ?? []) as ReviewRow[];

  return (
    <main className="space-y-4">
      <section className="rounded-xl border bg-white p-4">
        <h1 className="text-2xl font-bold">{bookRes.data.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          著者: {bookRes.data.author ?? "不明"} / ISBN: {bookRes.data.isbn ?? "未登録"}
        </p>
      </section>

      <BookReviewForm bookId={id} />

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">感想一覧 ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">まだ感想はありません。</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reviews.map((review) => {
              const author = Array.isArray(review.users) ? review.users[0] : review.users;
              return (
                <li key={review.id} className="rounded-lg border p-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">評価:</span> {review.rating}/5
                    {" · "}
                    <span className="font-medium">投稿者:</span> {author?.display_name ?? "unknown"}
                  </p>
                  {review.body && <p className="mt-2 whitespace-pre-wrap text-sm">{review.body}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
