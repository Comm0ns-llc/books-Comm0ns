import { fail, ok } from "@/lib/response";
import { getSupabaseForRequest } from "@/lib/supabase";

type Params = { params: Promise<{ isbn: string }> };

type BookMeta = {
  isbn: string;
  title: string;
  author: string | null;
  publisher: string | null;
  published_date: string | null;
  cover_url: string | null;
  description: string | null;
  page_count: number | null;
};

async function fromGoogleBooks(isbn: string): Promise<BookMeta | null> {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, {
    cache: "no-store"
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    items?: Array<{
      volumeInfo?: {
        title?: string;
        authors?: string[];
        publisher?: string;
        publishedDate?: string;
        imageLinks?: { thumbnail?: string };
        description?: string;
        pageCount?: number;
      };
    }>;
  };

  const info = json.items?.[0]?.volumeInfo;
  if (!info?.title) return null;

  return {
    isbn,
    title: info.title,
    author: info.authors?.join(", ") ?? null,
    publisher: info.publisher ?? null,
    published_date: info.publishedDate ?? null,
    cover_url: info.imageLinks?.thumbnail ?? null,
    description: info.description ?? null,
    page_count: info.pageCount ?? null
  };
}

async function fromOpenBd(isbn: string): Promise<BookMeta | null> {
  const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`, { cache: "no-store" });
  if (!res.ok) return null;

  const json = (await res.json()) as Array<{
    summary?: {
      title?: string;
      author?: string;
      publisher?: string;
      pubdate?: string;
      cover?: string;
    };
  } | null>;

  const summary = json[0]?.summary;
  if (!summary?.title) return null;

  return {
    isbn,
    title: summary.title,
    author: summary.author ?? null,
    publisher: summary.publisher ?? null,
    published_date: summary.pubdate ?? null,
    cover_url: summary.cover ?? null,
    description: null,
    page_count: null
  };
}

export async function GET(_: Request, { params }: Params) {
  const { isbn } = await params;
  const supabase = await getSupabaseForRequest();

  const { data: existing } = await supabase.from("books").select("*").eq("isbn", isbn).single();
  if (existing) return ok(existing);

  const external = (await fromGoogleBooks(isbn)) ?? (await fromOpenBd(isbn));
  if (!external) return fail("Book not found", 404);

  const { data: inserted, error } = await supabase.from("books").insert(external).select("*").single();
  if (error) return fail(error.message, 400);

  return ok(inserted, 201);
}
