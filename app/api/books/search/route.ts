import { ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

type ExternalBook = {
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  cover_url: string | null;
  page_count: number | null;
  genre: string[];
  source: "google";
};

async function searchGoogleBooks(q: string): Promise<ExternalBook[]> {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`, {
    cache: "no-store"
  });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    items?: Array<{
      volumeInfo?: {
        title?: string;
        authors?: string[];
        publisher?: string;
        imageLinks?: { thumbnail?: string };
        pageCount?: number;
        categories?: string[];
        industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
      };
    }>;
  };

  const books: ExternalBook[] = [];
  for (const item of json.items ?? []) {
    const info = item.volumeInfo;
    if (!info?.title) continue;
    const isbn13 = info.industryIdentifiers?.find((entry) => entry.type === "ISBN_13")?.identifier ?? null;
    books.push({
      isbn: isbn13,
      title: info.title,
      author: info.authors?.join(", ") ?? null,
      publisher: info.publisher ?? null,
      cover_url: info.imageLinks?.thumbnail ?? null,
      page_count: info.pageCount ?? null,
      genre: info.categories ?? [],
      source: "google"
    });
  }
  return books;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) return ok([]);

  const supabase = await getSupabaseForRequest();
  const [{ data: internal }, external] = await Promise.all([
    supabase
      .from("books")
      .select("id, isbn, title, author, publisher, cover_url, page_count, genre")
      .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
      .limit(30),
    searchGoogleBooks(q)
  ]);

  const isbnSet = new Set(
    [...(internal ?? []), ...external]
      .map((book) => book.isbn ?? null)
      .filter((isbn): isbn is string => Boolean(isbn))
  );

  const statsByIsbn = new Map<string, { commonsCopies: number; availableCount: number }>();
  if (isbnSet.size > 0) {
    const { data: rows } = await supabase
      .from("books")
      .select("isbn, user_books(status)")
      .in("isbn", Array.from(isbnSet));

    for (const row of rows ?? []) {
      const isbn = row.isbn;
      if (!isbn) continue;
      const instances = (row.user_books ?? []) as Array<{ status: "available" | "lent_out" | "private" | "reading" }>;
      const commonsCopies = instances.length;
      const availableCount = instances.filter((item) => item.status === "available").length;
      statsByIsbn.set(isbn, { commonsCopies, availableCount });
    }
  }

  const merged = new Map<
    string,
    {
      id: string | null;
      isbn: string | null;
      title: string;
      author: string | null;
      publisher: string | null;
      cover_url: string | null;
      page_count: number | null;
      genre: string[];
      inCommons: boolean;
      commonsCopies: number;
      availableCount: number;
      source: "commons" | "google" | "mixed";
    }
  >();

  for (const book of internal ?? []) {
    const key = book.isbn ?? `${book.title}::${book.author ?? ""}`;
    const stats = book.isbn ? statsByIsbn.get(book.isbn) : undefined;
    merged.set(key, {
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      cover_url: book.cover_url,
      page_count: book.page_count,
      genre: book.genre ?? [],
      inCommons: true,
      commonsCopies: stats?.commonsCopies ?? 0,
      availableCount: stats?.availableCount ?? 0,
      source: "commons"
    });
  }

  for (const book of external) {
    const key = book.isbn ?? `${book.title}::${book.author ?? ""}`;
    const existing = merged.get(key);
    const stats = book.isbn ? statsByIsbn.get(book.isbn) : undefined;
    if (existing) {
      merged.set(key, {
        ...existing,
        isbn: existing.isbn ?? book.isbn,
        cover_url: existing.cover_url ?? book.cover_url,
        page_count: existing.page_count ?? book.page_count,
        genre: existing.genre.length > 0 ? existing.genre : book.genre,
        source: "mixed"
      });
      continue;
    }
    merged.set(key, {
      id: null,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      cover_url: book.cover_url,
      page_count: book.page_count,
      genre: book.genre,
      inCommons: Boolean(stats),
      commonsCopies: stats?.commonsCopies ?? 0,
      availableCount: stats?.availableCount ?? 0,
      source: "google"
    });
  }

  const data = Array.from(merged.values()).sort((a, b) => {
    if (a.inCommons !== b.inCommons) return a.inCommons ? -1 : 1;
    if (a.availableCount !== b.availableCount) return b.availableCount - a.availableCount;
    return a.title.localeCompare(b.title, "ja");
  });

  return ok(data.slice(0, 50));
}
