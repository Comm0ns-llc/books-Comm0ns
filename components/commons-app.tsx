"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import WebDesktopExperience from "@/components/commons-web-desktop";

type User = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  books: number;
  lent: number;
  color: string;
};

type BookStatus = "available" | "lent_out" | "private" | "reading";

type Book = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  genre: string[];
  pages: number;
  owners: string[];
  status: Record<string, BookStatus>;
  color: string;
};

type Review = {
  id: string;
  bookId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  date: string;
};

type GlobalSearchBook = {
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
};

type LoanStatus = "requested" | "approved" | "active" | "returned" | "rejected";

type Loan = {
  id: string;
  bookId: string;
  ownerId: string;
  borrowerId: string;
  status: LoanStatus;
  date: string;
  msg: string;
};

type ApiUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  status?: "unverified" | "active";
};

type ApiUserBooksRow = {
  status: BookStatus;
  books:
    | {
        id: string;
        title: string;
        author: string | null;
        publisher: string | null;
        genre: string[] | null;
        page_count: number | null;
      }
    | {
        id: string;
        title: string;
        author: string | null;
        publisher: string | null;
        genre: string[] | null;
        page_count: number | null;
      }[];
};

type Route =
  | { p: "home" | "search" | "shelf" | "loans" | "profile"; t: "home" | "search" | "shelf" | "loans" | "profile" }
  | { p: "book"; id: string; t: "home" | "search" | "shelf" | "loans" | "profile" }
  | { p: "user"; id: string; t: "home" | "search" | "shelf" | "loans" | "profile" };

const USERS: User[] = [
  {
    id: "u1",
    name: "田中 悠太",
    avatar: "YT",
    bio: "ソフトウェアエンジニア。SF小説とデザイン本が好き。",
    location: "東京・渋谷",
    books: 24,
    lent: 12,
    color: "#6b8f71"
  },
  {
    id: "u2",
    name: "佐藤 美咲",
    avatar: "MS",
    bio: "イラストレーター。絵本と美術書のコレクター。",
    location: "東京・下北沢",
    books: 38,
    lent: 8,
    color: "#8b7355"
  },
  {
    id: "u3",
    name: "鈴木 健一",
    avatar: "KS",
    bio: "高校教師。歴史と哲学を教えています。",
    location: "横浜・元町",
    books: 56,
    lent: 21,
    color: "#5a7d9a"
  },
  {
    id: "u4",
    name: "山本 さくら",
    avatar: "SY",
    bio: "研究者。分子生物学専攻。科学エッセイ好き。",
    location: "川崎",
    books: 19,
    lent: 5,
    color: "#9a6b7d"
  }
];

const BOOKS: Book[] = [
  {
    id: "b1",
    title: "こころ",
    author: "夏目漱石",
    publisher: "新潮社",
    genre: ["文学", "古典"],
    pages: 376,
    owners: ["u1", "u3"],
    status: { u1: "available", u3: "lent_out" },
    color: "#c4b5a0"
  },
  {
    id: "b2",
    title: "星の王子さま",
    author: "サン＝テグジュペリ",
    publisher: "岩波書店",
    genre: ["文学", "児童文学"],
    pages: 160,
    owners: ["u2", "u4"],
    status: { u2: "available", u4: "available" },
    color: "#a0b5c4"
  },
  {
    id: "b3",
    title: "三体",
    author: "劉 慈欣",
    publisher: "早川書房",
    genre: ["SF", "海外文学"],
    pages: 480,
    owners: ["u1"],
    status: { u1: "available" },
    color: "#2d3436"
  },
  {
    id: "b4",
    title: "ノルウェイの森",
    author: "村上春樹",
    publisher: "講談社",
    genre: ["文学", "現代小説"],
    pages: 400,
    owners: ["u1", "u2", "u3"],
    status: { u1: "reading", u2: "available", u3: "available" },
    color: "#6b4423"
  },
  {
    id: "b5",
    title: "火花",
    author: "又吉直樹",
    publisher: "文藝春秋",
    genre: ["文学", "現代小説"],
    pages: 152,
    owners: ["u3"],
    status: { u3: "available" },
    color: "#c0392b"
  },
  {
    id: "b6",
    title: "アンドロイドは電気羊の夢を見るか？",
    author: "フィリップ・K・ディック",
    publisher: "早川書房",
    genre: ["SF", "海外文学"],
    pages: 336,
    owners: ["u1", "u4"],
    status: { u1: "available", u4: "lent_out" },
    color: "#5f6a72"
  },
  {
    id: "b7",
    title: "サピエンス全史",
    author: "ユヴァル・ノア・ハラリ",
    publisher: "河出書房新社",
    genre: ["ノンフィクション", "歴史"],
    pages: 514,
    owners: ["u3", "u4"],
    status: { u3: "available", u4: "available" },
    color: "#d4a854"
  },
  {
    id: "b8",
    title: "人間失格",
    author: "太宰治",
    publisher: "新潮社",
    genre: ["文学", "古典"],
    pages: 208,
    owners: ["u2", "u3"],
    status: { u2: "private", u3: "available" },
    color: "#4a4a4a"
  },
  {
    id: "b9",
    title: "嫌われる勇気",
    author: "岸見一郎・古賀史健",
    publisher: "ダイヤモンド社",
    genre: ["自己啓発", "哲学"],
    pages: 296,
    owners: ["u1", "u2"],
    status: { u1: "available", u2: "available" },
    color: "#2980b9"
  },
  {
    id: "b10",
    title: "コンビニ人間",
    author: "村田沙耶香",
    publisher: "文藝春秋",
    genre: ["文学", "現代小説"],
    pages: 163,
    owners: ["u4"],
    status: { u4: "available" },
    color: "#6ab04c"
  }
];

const REVIEWS: Review[] = [
  {
    id: "r1",
    bookId: "b1",
    userId: "u1",
    rating: 5,
    body: "何度読んでも心を揺さぶられる。特に後半の展開は息を呑む。近代日本文学の最高傑作のひとつ。",
    date: "2025-12-15"
  },
  {
    id: "r2",
    bookId: "b1",
    userId: "u3",
    rating: 4,
    body: "教科書で断片的に読んだのとは全く違う体験。通して読むべき。",
    date: "2026-01-20"
  },
  {
    id: "r3",
    bookId: "b3",
    userId: "u1",
    rating: 5,
    body: "圧倒的スケール。科学とSFの融合がここまで高いレベルで実現された作品は稀。",
    date: "2026-01-05"
  },
  {
    id: "r4",
    bookId: "b4",
    userId: "u2",
    rating: 4,
    body: "村上春樹の原点。静かで透明な文体が心地よい。",
    date: "2025-11-30"
  },
  {
    id: "r5",
    bookId: "b7",
    userId: "u3",
    rating: 5,
    body: "人類史の見方が根本から変わる。授業でも使っている。",
    date: "2025-10-10"
  },
  {
    id: "r6",
    bookId: "b9",
    userId: "u1",
    rating: 4,
    body: "アドラー心理学の入門として秀逸。対話形式で読みやすい。",
    date: "2026-01-28"
  },
  {
    id: "r7",
    bookId: "b2",
    userId: "u2",
    rating: 5,
    body: "大人になってから読み返すと、全く違う深さがある。挿絵も含めて完璧。",
    date: "2026-01-10"
  },
  {
    id: "r8",
    bookId: "b6",
    userId: "u4",
    rating: 4,
    body: "ディックの世界観に引き込まれる。映画とは別物として楽しめた。",
    date: "2025-12-20"
  }
];

const LOANS: Loan[] = [
  {
    id: "l1",
    bookId: "b1",
    ownerId: "u3",
    borrowerId: "u2",
    status: "active",
    date: "2026-01-25",
    msg: "ずっと読みたかったです！"
  },
  {
    id: "l2",
    bookId: "b6",
    ownerId: "u4",
    borrowerId: "u3",
    status: "active",
    date: "2026-01-20",
    msg: "SF好きとして外せない一冊。"
  },
  {
    id: "l3",
    bookId: "b4",
    ownerId: "u2",
    borrowerId: "u1",
    status: "returned",
    date: "2025-12-01",
    msg: "久しぶりに読み返したい。"
  },
  {
    id: "l4",
    bookId: "b7",
    ownerId: "u3",
    borrowerId: "u1",
    status: "requested",
    date: "2026-02-05",
    msg: "歴史の見方を変えてくれると聞いて。"
  }
];

const ME = USERS[0];

function toAvatarLabel(name: string) {
  const compact = name.replace(/\s+/g, "");
  return compact.slice(0, 2).toUpperCase();
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap');
:root {
  --serif: 'Shippori Mincho', 'Hiragino Mincho ProN', serif;
  --sans: 'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif;
  --ink: #1c1917; --ink2: #44403c; --ink3: #78716c; --ink4: #a8a29e; --ink5: #d6d3d1;
  --bg: #faf9f7; --bg2: #f5f3f0; --bg3: #eceae6;
  --warm: #c2a36e; --warm-bg: #faf5eb;
  --grn: #5a7c5e; --grn-bg: #eef4ef;
  --blu: #4a6d8c; --blu-bg: #eaf1f6;
  --red: #b85c5c;
  --r: 14px; --rs: 8px;
  --t: 0.25s cubic-bezier(0.4,0,0.2,1);
  --se: var(--serif); --sa: var(--sans);
  --i: var(--ink); --i2: var(--ink2); --i3: var(--ink3); --i4: var(--ink4); --i5: var(--ink5);
  --b: var(--bg); --b2: var(--bg2); --b3: var(--bg3);
  --w: var(--warm); --wb: var(--warm-bg); --g: var(--grn); --gb: var(--grn-bg);
  --bl: var(--blu); --blb: var(--blu-bg); --rd: var(--red);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{background:#e8e5e0}
input,button,textarea{font-family:var(--sans)}
input::placeholder{color:var(--ink4)}
::-webkit-scrollbar{width:0;height:0}
@keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes si{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
`;

function Stars({ n, sz = 12 }: { n: number; sz?: number }) {
  return (
    <span style={{ letterSpacing: 2, fontSize: sz, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= n ? "var(--warm)" : "var(--ink5)" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function Pill({
  children,
  c = "var(--ink3)",
  bg = "var(--bg3)"
}: {
  children: ReactNode;
  c?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        color: c,
        background: bg,
        fontFamily: "var(--sans)",
        letterSpacing: 0.3,
        lineHeight: "16px",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </span>
  );
}

const sMap: Record<BookStatus, { l: string; c: string; b: string }> = {
  available: { l: "貸出可", c: "var(--grn)", b: "var(--grn-bg)" },
  lent_out: { l: "貸出中", c: "var(--warm)", b: "var(--warm-bg)" },
  private: { l: "非公開", c: "var(--ink4)", b: "var(--bg3)" },
  reading: { l: "読書中", c: "var(--blu)", b: "var(--blu-bg)" }
};

function SPill({ s }: { s: BookStatus }) {
  const m = sMap[s];
  return (
    <Pill c={m.c} bg={m.b}>
      {m.l}
    </Pill>
  );
}

function Av({ u, sz = 36 }: { u: User; sz?: number }) {
  return (
    <div
      style={{
        width: sz,
        height: sz,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: sz * 0.32,
        fontWeight: 700,
        color: "#fff",
        background: u.color,
        flexShrink: 0,
        fontFamily: "var(--sans)",
        letterSpacing: 1
      }}
    >
      {u.avatar}
    </div>
  );
}

function Bk({ b, sz = 56 }: { b: Book; sz?: number }) {
  return (
    <div
      style={{
        width: sz,
        height: sz * 1.45,
        borderRadius: 4,
        flexShrink: 0,
        background: `linear-gradient(135deg, ${b.color}dd, ${b.color})`,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: `0 4px ${sz * 0.08}px`,
        position: "relative",
        overflow: "hidden",
        boxShadow: "2px 4px 12px rgba(0,0,0,.12), inset -2px 0 6px rgba(255,255,255,.08)"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,.12) 0%, transparent 40%, rgba(0,0,0,.15) 100%)"
        }}
      />
      <span
        style={{
          fontSize: Math.max(8, sz * 0.15),
          color: "rgba(255,255,255,.9)",
          fontFamily: "var(--serif)",
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.2,
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}
      >
        {b.title}
      </span>
    </div>
  );
}

function Emp({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--ink4)" }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.6 }}>{icon}</div>
      <div style={{ fontSize: 13, fontFamily: "var(--sans)" }}>{text}</div>
    </div>
  );
}

function Hdr({
  title,
  onBack,
  right
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        minHeight: 56,
        background: "rgba(250,249,247,.85)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderBottom: "1px solid var(--bg3)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "var(--ink)",
              padding: 0,
              lineHeight: 1,
              fontFamily: "var(--sans)"
            }}
          >
            ←
          </button>
        )}
        <h1
          style={{
            fontSize: onBack ? 15 : 17,
            fontWeight: onBack ? 500 : 700,
            fontFamily: "var(--serif)",
            color: "var(--ink)",
            letterSpacing: 0.8
          }}
        >
          {title}
        </h1>
      </div>
      {right}
    </header>
  );
}

function Nav({
  cur,
  set
}: {
  cur: "home" | "search" | "shelf" | "loans" | "profile";
  set: (t: "home" | "search" | "shelf" | "loans" | "profile") => void;
}) {
  const ts = [
    { id: "home", d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10", l: "ホーム" },
    { id: "search", d: "M11 3a8 8 0 100 16 8 8 0 000-16z M21 21l-4.35-4.35", l: "検索" },
    {
      id: "shelf",
      d: "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
      l: "本棚"
    },
    { id: "loans", d: "M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3", l: "貸出" },
    {
      id: "profile",
      d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 110 8 4 4 0 010-8z",
      l: "マイ"
    }
  ] as const;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        height: 68,
        background: "rgba(250,249,247,.92)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderTop: "1px solid var(--bg3)",
        display: "flex",
        zIndex: 100
      }}
    >
      {ts.map((t) => {
        const a = cur === t.id;
        return (
          <button
            key={t.id}
            onClick={() => set(t.id)}
            style={{
              flex: 1,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "all .2s",
              color: a ? "var(--ink)" : "var(--ink4)",
              fontFamily: "var(--sans)",
              opacity: a ? 1 : 0.6
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "all var(--t)", transform: a ? "scale(1.08)" : "scale(1)" }}
            >
              {t.d.split(" M").map((p, i) => (
                <path key={p + i} d={(i ? "M" : "") + p} />
              ))}
            </svg>
            <span style={{ fontSize: 10, fontWeight: a ? 600 : 400, letterSpacing: 0.5 }}>{t.l}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ padding: "24px 0 0" }}>
      <div style={{ padding: "0 24px 12px" }}>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--ink2)",
            fontFamily: "var(--sans)",
            letterSpacing: 1.5
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Home({
  go,
  books,
  reviews,
  pendingCount,
  users,
  me
}: {
  go: (p: "book" | "user", id: string) => void;
  books: Book[];
  reviews: Review[];
  pendingCount: number;
  users: User[];
  me: User;
}) {
  const recent = [...reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div>
      <Hdr
        title="本のコモンズ"
        right={
          <div style={{ position: "relative", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {pendingCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -8,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 10,
                  background: "var(--red)",
                  color: "#fff",
                  fontSize: 10,
                  padding: "0 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {pendingCount}
              </div>
            )}
          </div>
        }
      />
      <div style={{ paddingBottom: 90 }}>
        <div
          style={{
            padding: "32px 24px",
            borderBottom: "1px solid var(--bg3)",
            background: "linear-gradient(180deg,var(--bg) 0%,var(--bg2) 100%)"
          }}
        >
          <p style={{ fontSize: 13, color: "var(--ink4)", fontFamily: "var(--sans)", fontWeight: 300, marginBottom: 6 }}>
            おはよう、{me.name}さん
          </p>
          <p style={{ fontSize: 20, color: "var(--ink)", fontFamily: "var(--serif)", fontWeight: 600, lineHeight: 1.6, letterSpacing: 0.5 }}>
            <span style={{ color: "var(--warm)", fontWeight: 800 }}>{books.length}</span>冊の本が
            <br />
            コミュニティで共有されています
          </p>
        </div>

        <Sec title="新着の本">
          <div style={{ display: "flex", gap: 18, overflowX: "auto", padding: "0 24px 24px" }}>
            {books.slice(0, 7).map((b, i) => (
              <div
                key={b.id}
                onClick={() => go("book", b.id)}
                style={{ flexShrink: 0, cursor: "pointer", animation: `su .4s ease-out ${i * 0.06}s both` }}
              >
                <Bk b={b} sz={72} />
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    marginTop: 8,
                    color: "var(--ink2)",
                    fontFamily: "var(--sans)",
                    width: 72,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {b.title}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--ink4)",
                    fontFamily: "var(--sans)",
                    fontWeight: 300,
                    marginTop: 1,
                    width: 72,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {b.author}
                </p>
              </div>
            ))}
          </div>
        </Sec>

        <Sec title="最新の感想">
          <div style={{ padding: "0 24px" }}>
            {recent.map((r, i) => {
              const b = books.find((x) => x.id === r.bookId);
              const u = users.find((x) => x.id === r.userId);
              if (!b || !u) return null;
              return (
                <div
                  key={r.id}
                  onClick={() => go("book", r.bookId)}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "16px 0",
                    borderTop: i ? "1px solid var(--bg3)" : "none",
                    cursor: "pointer",
                    animation: `su .4s ease-out ${i * 0.08}s both`
                  }}
                >
                  <Bk b={b} sz={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <Av u={u} sz={20} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink2)", fontFamily: "var(--sans)" }}>{u.name}</span>
                      <Stars n={r.rating} sz={10} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--serif)", marginBottom: 4 }}>{b.title}</p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ink3)",
                        lineHeight: 1.65,
                        fontFamily: "var(--sans)",
                        fontWeight: 300,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {r.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Sec>

        <Sec title="メンバー">
          <div style={{ display: "flex", gap: 24, padding: "0 24px 24px" }}>
            {users.map((u, i) => (
              <div key={u.id} onClick={() => go("user", u.id)} style={{ textAlign: "center", cursor: "pointer", animation: `su .4s ease-out ${i * 0.08}s both` }}>
                <Av u={u} sz={48} />
                <p style={{ fontSize: 11, marginTop: 6, color: "var(--ink2)", fontFamily: "var(--sans)" }}>{u.name.split(" ")[1]}</p>
                <p style={{ fontSize: 10, color: "var(--ink4)", marginTop: 1, fontFamily: "var(--sans)" }}>{u.books}冊</p>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  );
}

function Search({ go, books, reviews }: { go: (p: "book", id: string) => void; books: Book[]; reviews: Review[] }) {
  const [q, sQ] = useState("");
  const [g, sG] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [results, setResults] = useState<GlobalSearchBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const gs = ["all", "文学", "SF", "ノンフィクション", "古典", "哲学", "現代小説"];

  useEffect(() => {
    let cancelled = false;
    async function search() {
      const query = q.trim();
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      const json = (await response.json().catch(() => null)) as { data?: GlobalSearchBook[]; error?: string } | null;
      if (cancelled) return;

      if (!response.ok) {
        setError(json?.error ?? "検索に失敗しました。");
        setLoading(false);
        return;
      }

      setResults(json?.data ?? []);
      setLoading(false);
    }

    void search();
    return () => {
      cancelled = true;
    };
  }, [q]);

  async function addToCommons(book: GlobalSearchBook) {
    if (!book.isbn) {
      setError("ISBNが無い書籍はこの画面から追加できません。");
      return;
    }
    const key = book.isbn ?? book.title;
    setAddingKey(key);
    setError(null);

    const importRes = await fetch(`/api/books/isbn/${book.isbn}`, { cache: "no-store" });
    const importJson = (await importRes.json().catch(() => null)) as { data?: { id?: string }; error?: string } | null;
    if (!importRes.ok || !importJson?.data?.id) {
      setError(importJson?.error ?? "書籍情報の取り込みに失敗しました。");
      setAddingKey(null);
      return;
    }

    const addRes = await fetch("/api/user-books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: importJson.data.id,
        status: "available",
        condition: "good"
      })
    });
    const addJson = (await addRes.json().catch(() => null)) as { error?: string } | null;
    if (!addRes.ok) {
      setError(addJson?.error ?? "本棚への追加に失敗しました。");
      setAddingKey(null);
      return;
    }

    setAddingKey(null);
    go("book", importJson.data.id);
  }

  const localFallback = useMemo(
    () =>
      books.filter((b) => {
        const mq = !q || b.title.includes(q) || b.author.includes(q);
        const mg = g === "all" || b.genre.includes(g);
        const ma = !onlyAvailable || Object.values(b.status).some((v) => v === "available");
        return mq && mg && ma;
      }),
    [books, g, onlyAvailable, q]
  );

  const remoteFiltered = useMemo(
    () =>
      results.filter((b) => {
        const mg = g === "all" || (b.genre ?? []).includes(g);
        const ma = !onlyAvailable || b.availableCount > 0;
        return mg && ma;
      }),
    [g, onlyAvailable, results]
  );

  const showingRemote = q.trim().length > 0;

  return (
    <div>
      <Hdr title="検索" />
      <div style={{ paddingBottom: 90 }}>
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 16px",
              background: "var(--bg2)",
              borderRadius: "var(--r)",
              border: "1px solid var(--bg3)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={q}
              onChange={(e) => sQ(e.target.value)}
              placeholder="タイトル・著者で検索"
              style={{ border: "none", background: "none", flex: 1, outline: "none", fontSize: 14, color: "var(--ink)" }}
            />
            {q && (
              <span onClick={() => sQ("")} style={{ cursor: "pointer", color: "var(--ink4)", fontSize: 14 }}>
                ✕
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto" }}>
          {gs.map((x) => (
            <button
              key={x}
              onClick={() => sG(x)}
              style={{
                border: g === x ? "1.5px solid var(--ink)" : "1px solid var(--bg3)",
                background: g === x ? "var(--ink)" : "var(--bg)",
                color: g === x ? "#fff" : "var(--ink3)",
                borderRadius: 20,
                padding: "7px 16px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "var(--sans)",
                fontWeight: g === x ? 600 : 400,
                transition: "all var(--t)",
                whiteSpace: "nowrap",
                flexShrink: 0
              }}
            >
              {x === "all" ? "すべて" : x}
            </button>
          ))}
          <button
            onClick={() => setOnlyAvailable((v) => !v)}
            style={{
              border: onlyAvailable ? "1.5px solid var(--grn)" : "1px solid var(--bg3)",
              background: onlyAvailable ? "var(--grn-bg)" : "var(--bg)",
              color: onlyAvailable ? "var(--grn)" : "var(--ink3)",
              borderRadius: 20,
              padding: "7px 16px",
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            貸出可のみ
          </button>
        </div>
        <div style={{ padding: "0 20px" }}>
          <p style={{ fontSize: 11, color: "var(--ink4)", marginBottom: 12, fontFamily: "var(--sans)" }}>
            {showingRemote ? remoteFiltered.length : localFallback.length}件
          </p>
          {error && <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 10 }}>{error}</p>}
          {loading && showingRemote && <p style={{ fontSize: 12, color: "var(--ink4)", marginBottom: 10 }}>検索中...</p>}
          {!showingRemote &&
            localFallback.map((b, i) => {
            const rv = reviews.filter((r) => r.bookId === b.id);
            const av = rv.length ? rv.reduce((s, r) => s + r.rating, 0) / rv.length : 0;
            const ac = Object.values(b.status).filter((s) => s === "available").length;
            return (
              <div
                key={b.id}
                onClick={() => go("book", b.id)}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--bg3)",
                  cursor: "pointer",
                  animation: `fi .3s ease-out ${i * 0.04}s both`
                }}
              >
                <Bk b={b} sz={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--serif)", marginBottom: 3 }}>{b.title}</p>
                  <p style={{ fontSize: 12, color: "var(--ink4)", fontFamily: "var(--sans)", fontWeight: 300, marginBottom: 8 }}>
                    {b.author} · {b.publisher}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {rv.length > 0 && (
                      <>
                        <Stars n={Math.round(av)} sz={10} />
                        <span style={{ fontSize: 11, color: "var(--ink4)", fontFamily: "var(--sans)" }}>({rv.length})</span>
                      </>
                    )}
                    {ac > 0 && (
                      <Pill c="var(--grn)" bg="var(--grn-bg)">
                        {ac}冊 貸出可
                      </Pill>
                    )}
                    {b.genre.slice(0, 2).map((x) => (
                      <Pill key={x}>{x}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {showingRemote &&
            remoteFiltered.map((b, i) => (
              <div
                key={(b.isbn ?? b.title) + i}
                onClick={() => {
                  if (b.id) go("book", b.id);
                }}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--bg3)",
                  cursor: b.id ? "pointer" : "default",
                  animation: `fi .3s ease-out ${i * 0.04}s both`
                }}
              >
                <div style={{ width: 48, height: 70, borderRadius: 4, background: "var(--bg3)", overflow: "hidden", flexShrink: 0 }}>
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : null}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--serif)", marginBottom: 3 }}>{b.title}</p>
                  <p style={{ fontSize: 12, color: "var(--ink4)", fontFamily: "var(--sans)", fontWeight: 300, marginBottom: 8 }}>
                    {b.author ?? "著者不明"} · {b.publisher ?? "出版社不明"}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                    {b.inCommons ? (
                      <>
                        <Pill c="var(--grn)" bg="var(--grn-bg)">Comm0ns所蔵 {b.commonsCopies}冊</Pill>
                        <Pill c="var(--blu)" bg="var(--blu-bg)">貸出可 {b.availableCount}冊</Pill>
                      </>
                    ) : (
                      <Pill c="var(--ink4)" bg="var(--bg3)">Comm0ns未保持</Pill>
                    )}
                    {(b.genre ?? []).slice(0, 2).map((x) => (
                      <Pill key={x}>{x}</Pill>
                    ))}
                  </div>
                  {!b.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void addToCommons(b);
                      }}
                      disabled={addingKey === (b.isbn ?? b.title)}
                      style={{
                        border: "none",
                        borderRadius: 8,
                        background: "var(--ink)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "7px 12px",
                        cursor: "pointer",
                        opacity: addingKey === (b.isbn ?? b.title) ? 0.65 : 1
                      }}
                    >
                      {addingKey === (b.isbn ?? b.title) ? "追加中..." : "Comm0nsに追加"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          {!showingRemote && !localFallback.length && <Emp icon="📭" text="該当する本が見つかりません" />}
          {showingRemote && !loading && !remoteFiltered.length && <Emp icon="📭" text="該当する本が見つかりません" />}
        </div>
      </div>
    </div>
  );
}

function Shelf({ go, books, me }: { go: (p: "book", id: string) => void; books: Book[]; me: User }) {
  const [open, sO] = useState(false);
  const [isbnInput, setIsbnInput] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const my = books.filter((b) => b.owners.includes(me.id));
  const st = [
    { n: my.length, l: "所有" },
    { n: my.filter((b) => b.status[me.id] === "available").length, l: "貸出可" },
    { n: my.filter((b) => b.status[me.id] === "lent_out").length, l: "貸出中" },
    { n: my.filter((b) => b.status[me.id] === "reading").length, l: "読書中" }
  ];

  async function addByIsbn(isbnRaw: string) {
    const isbn = isbnRaw.replace(/[^0-9Xx]/g, "");
    if (!isbn) return null;

    const importRes = await fetch(`/api/books/isbn/${isbn}`, { cache: "no-store" });
    const importJson = (await importRes.json().catch(() => null)) as { data?: { id?: string }; error?: string } | null;
    if (!importRes.ok || !importJson?.data?.id) {
      throw new Error(importJson?.error ?? `${isbn} の取り込みに失敗しました`);
    }

    const addRes = await fetch("/api/user-books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: importJson.data.id,
        status: "available",
        condition: "good"
      })
    });
    const addJson = (await addRes.json().catch(() => null)) as { error?: string } | null;
    if (!addRes.ok) {
      if ((addJson?.error ?? "").toLowerCase().includes("duplicate")) {
        return importJson.data.id;
      }
      throw new Error(addJson?.error ?? `${isbn} を本棚に追加できませんでした`);
    }

    return importJson.data.id;
  }

  async function handleManualAdd() {
    setAdding(true);
    setAddError(null);
    setAddMessage(null);
    try {
      const id = await addByIsbn(isbnInput);
      if (!id) throw new Error("ISBNを入力してください");
      setAddMessage("本を追加しました。");
      setIsbnInput("");
      go("book", id);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "追加に失敗しました");
    } finally {
      setAdding(false);
    }
  }

  async function handleShelfPhoto(file: File) {
    setAdding(true);
    setAddError(null);
    setAddMessage(null);
    try {
      const Detector = (window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => { detect: (source: ImageBitmap) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
      if (!Detector) {
        throw new Error("このブラウザは画像バーコード検出に未対応です。ISBN手入力をご利用ください。");
      }

      const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      const isbns = Array.from(
        new Set(
          codes
            .map((code) => code.rawValue ?? "")
            .map((value) => value.replace(/[^0-9Xx]/g, ""))
            .filter((value) => value.length === 13 || value.length === 10)
        )
      );

      if (isbns.length === 0) {
        throw new Error("画像からISBNバーコードを検出できませんでした。");
      }

      let success = 0;
      for (const isbn of isbns) {
        try {
          await addByIsbn(isbn);
          success += 1;
        } catch {
          // continue with next isbn
        }
      }
      setAddMessage(`画像から ${isbns.length} 件検出し、${success} 件追加しました。`);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "写真からの追加に失敗しました");
    } finally {
      setAdding(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <Hdr
        title="マイ本棚"
        right={
          <button
            onClick={() => sO(!open)}
            style={{
              border: open ? "none" : "1.5px solid var(--ink)",
              background: open ? "var(--ink)" : "transparent",
              color: open ? "#fff" : "var(--ink)",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--sans)",
              fontWeight: 600,
              transition: "all var(--t)"
            }}
          >
            {open ? "✕ 閉じる" : "＋ 追加"}
          </button>
        }
      />
      <div style={{ paddingBottom: 90 }}>
        {open && (
          <div
            style={{
              margin: "16px 20px",
              padding: 20,
              background: "var(--warm-bg)",
              borderRadius: "var(--r)",
              border: "1px solid rgba(194,163,110,.2)",
              animation: "si .2s ease-out"
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "var(--ink)", fontFamily: "var(--sans)" }}>本を追加</p>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                padding: 16,
                border: "2px dashed var(--warm)",
                borderRadius: "var(--rs)",
                background: "rgba(250,245,235,.6)",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--warm)",
                fontFamily: "var(--sans)",
                fontWeight: 600,
                marginBottom: 10
              }}
            >
              📷 本棚写真から一括追加
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleShelfPhoto(file);
                }
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="ISBN を入力"
                value={isbnInput}
                onChange={(e) => setIsbnInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid var(--bg3)",
                  borderRadius: "var(--rs)",
                  fontSize: 13,
                  outline: "none",
                  background: "var(--bg)"
                }}
              />
              <button
                onClick={() => void handleManualAdd()}
                disabled={adding}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "var(--rs)",
                  background: "var(--ink)",
                  color: "#fff",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  opacity: adding ? 0.65 : 1
                }}
              >
                {adding ? "処理中..." : "追加"}
              </button>
            </div>
            {addError && <p style={{ marginTop: 10, fontSize: 12, color: "var(--red)" }}>{addError}</p>}
            {addMessage && <p style={{ marginTop: 10, fontSize: 12, color: "var(--grn)" }}>{addMessage}</p>}
          </div>
        )}
        <div style={{ display: "flex", padding: "20px 20px 0", gap: 8 }}>
          {st.map((s) => (
            <div key={s.l} style={{ flex: 1, textAlign: "center", padding: "14px 0", background: "var(--bg2)", borderRadius: "var(--rs)", border: "1px solid var(--bg3)" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--serif)", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 10, color: "var(--ink4)", marginTop: 4, fontFamily: "var(--sans)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, padding: "24px 20px" }}>
          {my.map((b, i) => (
            <div key={b.id} onClick={() => go("book", b.id)} style={{ cursor: "pointer", textAlign: "center", animation: `su .35s ease-out ${i * 0.05}s both` }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <Bk b={b} sz={64} />
              </div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--ink2)",
                  fontFamily: "var(--sans)",
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {b.title}
              </p>
              <SPill s={b.status[me.id]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookDtl({
  id,
  go,
  back,
  books,
  reviews,
  users,
  me,
  hasRequested,
  onRequest
}: {
  id: string;
  go: (p: "user", uid: string) => void;
  back: () => void;
  books: Book[];
  reviews: Review[];
  users: User[];
  me: User;
  hasRequested: boolean;
  onRequest: (bookId: string) => void;
}) {
  const b = books.find((x) => x.id === id);
  if (!b) return null;

  const rv = reviews.filter((r) => r.bookId === id);
  const avg = rv.length ? (rv.reduce((s, r) => s + r.rating, 0) / rv.length).toFixed(1) : null;
  const ow = b.owners.map((i) => users.find((u) => u.id === i)).filter(Boolean) as User[];

  const [tab, sT] = useState<"info" | "reviews" | "owners">("info");
  const tabs = [
    { id: "info", l: "詳細" },
    { id: "reviews", l: `感想 (${rv.length})` },
    { id: "owners", l: `所有者 (${ow.length})` }
  ] as const;

  return (
    <div>
      <Hdr title="" onBack={back} />
      <div style={{ paddingBottom: 90 }}>
        <div
          style={{
            display: "flex",
            gap: 20,
            padding: "20px 24px 24px",
            background: `linear-gradient(180deg,${b.color}08 0%,var(--bg) 100%)`,
            borderBottom: "1px solid var(--bg3)"
          }}
        >
          <Bk b={b} sz={100} />
          <div style={{ flex: 1, paddingTop: 4 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--serif)", lineHeight: 1.4, marginBottom: 4, letterSpacing: 0.5 }}>
              {b.title}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink3)", fontFamily: "var(--sans)", fontWeight: 300, marginBottom: 3 }}>{b.author}</p>
            <p style={{ fontSize: 11, color: "var(--ink4)", fontFamily: "var(--sans)", marginBottom: 12 }}>
              {b.publisher} · {b.pages}p
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {avg && (
                <>
                  <Stars n={Math.round(parseFloat(avg))} sz={13} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--warm)", fontFamily: "var(--serif)" }}>{avg}</span>
                </>
              )}
              {b.genre.map((g) => (
                <Pill key={g}>{g}</Pill>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--bg3)" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => sT(t.id)}
              style={{
                flex: 1,
                padding: "13px 0",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--sans)",
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "var(--ink)" : "var(--ink4)",
                background: "none",
                borderBottom: tab === t.id ? "2px solid var(--ink)" : "2px solid transparent",
                transition: "all var(--t)"
              }}
            >
              {t.l}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px", animation: "fi .25s ease-out" }} key={tab}>
          {tab === "info" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { l: "ISBN", v: b.id.replace("b", "978410100100") },
                  { l: "ページ数", v: `${b.pages}p` },
                  { l: "出版社", v: b.publisher },
                  { l: "所有者", v: `${ow.length}人` }
                ].map((x) => (
                  <div key={x.l} style={{ padding: "12px 14px", background: "var(--bg2)", borderRadius: "var(--rs)", border: "1px solid var(--bg3)" }}>
                    <div style={{ fontSize: 10, color: "var(--ink4)", marginBottom: 3, fontFamily: "var(--sans)" }}>{x.l}</div>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, fontFamily: "var(--sans)" }}>{x.v}</div>
                  </div>
                ))}
              </div>
              {!b.owners.includes(me.id) && (
                <button
                  onClick={() => onRequest(id)}
                  disabled={hasRequested}
                  style={{
                    width: "100%",
                    padding: 15,
                    border: "none",
                    borderRadius: "var(--rs)",
                    background: hasRequested ? "var(--grn-bg)" : "var(--ink)",
                    color: hasRequested ? "var(--grn)" : "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: hasRequested ? "default" : "pointer",
                    fontFamily: "var(--sans)",
                    transition: "all .3s",
                    letterSpacing: 0.5
                  }}
                >
                  {hasRequested ? "✓ リクエスト送信済み" : "貸出をリクエスト"}
                </button>
              )}
            </>
          )}
          {tab === "reviews" && (
            <>
              {!rv.length && <Emp icon="💬" text="まだ感想がありません" />}
              {rv.map((r, i) => {
                const u = users.find((x) => x.id === r.userId);
                if (!u) return null;
                return (
                  <div
                    key={r.id}
                    style={{
                      padding: "16px 0",
                      borderBottom: i < rv.length - 1 ? "1px solid var(--bg3)" : "none",
                      animation: `su .3s ease-out ${i * 0.08}s both`
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <Av u={u} sz={28} />
                      <span onClick={() => go("user", u.id)} style={{ fontSize: 13, fontWeight: 500, color: "var(--ink2)", fontFamily: "var(--sans)", cursor: "pointer" }}>
                        {u.name}
                      </span>
                      <Stars n={r.rating} sz={11} />
                    </div>
                    <p style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.8, fontFamily: "var(--sans)", fontWeight: 300 }}>{r.body}</p>
                    <p style={{ fontSize: 11, color: "var(--ink5)", marginTop: 8, fontFamily: "var(--sans)" }}>{r.date} 読了</p>
                  </div>
                );
              })}
            </>
          )}
          {tab === "owners" && (
            <>
              {ow.map((u, i) => (
                <div
                  key={u.id}
                  onClick={() => go("user", u.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 0",
                    borderBottom: i < ow.length - 1 ? "1px solid var(--bg3)" : "none",
                    cursor: "pointer"
                  }}
                >
                  <Av u={u} sz={40} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--sans)" }}>{u.name}</p>
                    <p style={{ fontSize: 11, color: "var(--ink4)", fontFamily: "var(--sans)", marginTop: 2 }}>📍 {u.location}</p>
                  </div>
                  <SPill s={b.status[u.id]} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Loans({
  go,
  books,
  users,
  me,
  loans,
  onLoanStatus
}: {
  go: (p: "book", id: string) => void;
  books: Book[];
  users: User[];
  me: User;
  loans: Loan[];
  onLoanStatus: (loanId: string, status: LoanStatus) => void;
}) {
  const [tab, sT] = useState<"lending" | "borrowing">("lending");
  const lending = loans.filter((l) => l.ownerId === me.id);
  const borrowing = loans.filter((l) => l.borrowerId === me.id);
  const list = tab === "lending" ? lending : borrowing;

  const si: Record<LoanStatus, string> = { requested: "⏳", approved: "✓", active: "●", returned: "✓✓", rejected: "✕" };
  const sl: Record<LoanStatus, string> = {
    requested: "リクエスト中",
    approved: "承認済",
    active: "貸出中",
    returned: "返却済",
    rejected: "拒否"
  };
  const sc: Record<LoanStatus, string> = {
    requested: "var(--warm)",
    approved: "var(--blu)",
    active: "var(--grn)",
    returned: "var(--ink4)",
    rejected: "var(--red)"
  };

  return (
    <div>
      <Hdr title="貸出管理" />
      <div style={{ paddingBottom: 90 }}>
        <div style={{ display: "flex", margin: "16px 20px 0", background: "var(--bg2)", borderRadius: "var(--rs)", padding: 3 }}>
          {[{ id: "lending", l: "貸している" }, { id: "borrowing", l: "借りている" }].map((t) => (
            <button
              key={t.id}
              onClick={() => sT(t.id as "lending" | "borrowing")}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--sans)",
                fontWeight: tab === t.id ? 600 : 400,
                background: tab === t.id ? "var(--bg)" : "transparent",
                color: tab === t.id ? "var(--ink)" : "var(--ink4)",
                boxShadow: tab === t.id ? "0 1px 3px rgba(28,25,23,.04)" : "none",
                transition: "all var(--t)"
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 20px" }}>
          {!list.length && <Emp icon={tab === "lending" ? "📤" : "📥"} text="取引はありません" />}
          {list.map((loan, i) => {
            const b = books.find((x) => x.id === loan.bookId);
            const other = users.find((u) => u.id === (tab === "lending" ? loan.borrowerId : loan.ownerId));
            if (!b || !other) return null;

            return (
              <div
                key={loan.id}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: 16,
                  background: "var(--bg2)",
                  borderRadius: "var(--r)",
                  border: "1px solid var(--bg3)",
                  marginBottom: 10,
                  cursor: "pointer",
                  animation: `su .3s ease-out ${i * 0.06}s both`
                }}
                onClick={() => go("book", loan.bookId)}
              >
                <Bk b={b} sz={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--serif)" }}>{b.title}</p>
                    <span style={{ fontSize: 11, fontWeight: 600, color: sc[loan.status], fontFamily: "var(--sans)", whiteSpace: "nowrap", marginLeft: 8 }}>
                      {si[loan.status]} {sl[loan.status]}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Av u={other} sz={18} />
                    <span style={{ fontSize: 12, color: "var(--ink3)", fontFamily: "var(--sans)" }}>
                      {tab === "lending" ? `${other.name} に貸出` : `${other.name} から借用`}
                    </span>
                  </div>
                  {loan.msg && <p style={{ fontSize: 11, color: "var(--ink4)", fontStyle: "italic", fontFamily: "var(--sans)" }}>「{loan.msg}」</p>}
                  {loan.status === "requested" && tab === "lending" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onLoanStatus(loan.id, "approved")}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          border: "none",
                          borderRadius: "var(--rs)",
                          background: "var(--ink)",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "var(--sans)"
                        }}
                      >
                        承認
                      </button>
                      <button
                        onClick={() => onLoanStatus(loan.id, "rejected")}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          border: "1px solid var(--bg3)",
                          borderRadius: "var(--rs)",
                          background: "var(--bg)",
                          color: "var(--ink3)",
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "var(--sans)"
                        }}
                      >
                        拒否
                      </button>
                    </div>
                  )}
                  {loan.status === "approved" && tab === "lending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoanStatus(loan.id, "active");
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 0",
                        marginTop: 12,
                        border: "1.5px solid var(--blu)",
                        borderRadius: "var(--rs)",
                        background: "var(--blu-bg)",
                        color: "var(--blu)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--sans)"
                      }}
                    >
                      受け渡し完了
                    </button>
                  )}
                  {loan.status === "active" && tab === "lending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoanStatus(loan.id, "returned");
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 0",
                        marginTop: 12,
                        border: "1.5px solid var(--grn)",
                        borderRadius: "var(--rs)",
                        background: "var(--grn-bg)",
                        color: "var(--grn)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--sans)"
                      }}
                    >
                      返却を確認
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Profile({
  uid,
  go,
  back,
  books,
  reviews,
  users,
  me
}: {
  uid: string;
  go: (p: "book", id: string) => void;
  back: () => void;
  books: Book[];
  reviews: Review[];
  users: User[];
  me: User;
}) {
  const u = users.find((x) => x.id === uid) ?? me;
  const isMe = u.id === me.id;
  const uB = books.filter((b) => b.owners.includes(u.id));
  const uR = reviews.filter((r) => r.userId === u.id);
  const [tab, sT] = useState<"books" | "reviews">("books");

  return (
    <div>
      <Hdr
        title={isMe ? "プロフィール" : u.name}
        onBack={!isMe ? back : undefined}
        right={isMe && <span style={{ cursor: "pointer", fontSize: 18, color: "var(--ink3)" }}>⚙</span>}
      />
      <div style={{ paddingBottom: 90 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "28px 24px 24px",
            background: `linear-gradient(180deg,${u.color}08 0%,var(--bg) 100%)`,
            borderBottom: "1px solid var(--bg3)"
          }}
        >
          <Av u={u} sz={68} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 14, color: "var(--ink)", fontFamily: "var(--serif)", letterSpacing: 1 }}>{u.name}</h2>
          <p style={{ fontSize: 12, color: "var(--ink4)", marginTop: 4, fontFamily: "var(--sans)" }}>📍 {u.location}</p>
          <p style={{ fontSize: 13, color: "var(--ink3)", marginTop: 10, fontFamily: "var(--sans)", fontWeight: 300, lineHeight: 1.7, textAlign: "center", maxWidth: 280 }}>
            {u.bio}
          </p>
          <div style={{ display: "flex", gap: 36, marginTop: 20 }}>
            {[{ n: u.books, l: "蔵書" }, { n: u.lent, l: "貸出" }, { n: uR.length, l: "感想" }].map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--serif)" }}>{s.n}</div>
                <div style={{ fontSize: 10, color: "var(--ink4)", marginTop: 2, fontFamily: "var(--sans)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid var(--bg3)" }}>
          {[{ id: "books", l: "本棚" }, { id: "reviews", l: "感想" }].map((t) => (
            <button
              key={t.id}
              onClick={() => sT(t.id as "books" | "reviews")}
              style={{
                flex: 1,
                padding: "13px 0",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--sans)",
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "var(--ink)" : "var(--ink4)",
                background: "none",
                borderBottom: tab === t.id ? "2px solid var(--ink)" : "2px solid transparent"
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
        <div style={{ padding: 20 }} key={tab}>
          {tab === "books" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {uB.map((b, i) => (
                <div key={b.id} onClick={() => go("book", b.id)} style={{ cursor: "pointer", textAlign: "center", animation: `su .3s ease-out ${i * 0.05}s both` }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                    <Bk b={b} sz={56} />
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--ink2)",
                      fontFamily: "var(--sans)",
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {b.title}
                  </p>
                  <SPill s={b.status[u.id]} />
                </div>
              ))}
            </div>
          )}
          {tab === "reviews" && (
            <>
              {!uR.length && <Emp icon="💬" text="まだ感想がありません" />}
              {uR.map((r, i) => {
                const bk = books.find((x) => x.id === r.bookId);
                if (!bk) return null;
                return (
                  <div
                    key={r.id}
                    onClick={() => go("book", r.bookId)}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "14px 0",
                      borderBottom: "1px solid var(--bg3)",
                      cursor: "pointer",
                      animation: `su .3s ease-out ${i * 0.06}s both`
                    }}
                  >
                    <Bk b={bk} sz={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--serif)" }}>{bk.title}</span>
                        <Stars n={r.rating} sz={10} />
                      </div>
                      <p style={{ fontSize: 12, color: "var(--ink3)", lineHeight: 1.65, fontFamily: "var(--sans)", fontWeight: 300 }}>{r.body}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type UIMode = "auto" | "mobile" | "web";

function UiModeSwitcher({
  mode,
  onChange
}: {
  mode: UIMode;
  onChange: (mode: UIMode) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 180,
        display: "flex",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "rgba(28,25,23,.76)",
        backdropFilter: "blur(12px)"
      }}
    >
      {(["auto", "mobile", "web"] as UIMode[]).map((item) => {
        const active = mode === item;
        const label = item === "auto" ? "AUTO" : item === "mobile" ? "SP" : "WEB";
        return (
          <button
            key={item}
            onClick={() => onChange(item)}
            style={{
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.8,
              borderRadius: 999,
              padding: "6px 9px",
              color: active ? "#1c1917" : "rgba(255,255,255,.75)",
              background: active ? "#faf9f7" : "transparent"
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PhoneShell({
  routeKey,
  rendered,
  currentTab,
  onTab,
  framed = false,
  showBottomNav = true
}: {
  routeKey: string;
  rendered: ReactNode;
  currentTab: "home" | "search" | "shelf" | "loans" | "profile";
  onTab: (t: "home" | "search" | "shelf" | "loans" | "profile") => void;
  framed?: boolean;
  showBottomNav?: boolean;
}) {
  return (
    <div
      style={{
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        minHeight: "100vh",
        background: "var(--bg)",
        position: "relative",
        boxShadow: "0 0 60px rgba(28,25,23,.08)",
        borderRadius: framed ? 18 : 0,
        overflow: framed ? "hidden" : "visible"
      }}
    >
      <div key={routeKey} style={{ animation: "fi .2s ease-out" }}>
        {rendered}
      </div>
      {showBottomNav && <Nav cur={currentTab} set={onTab} />}
    </div>
  );
}

export default function CommonsApp() {
  return <CommonsAppInner initialTab="home" />;
}

type MainTab = "home" | "search" | "shelf" | "loans" | "profile";

export function CommonsAppInner({ initialTab }: { initialTab: MainTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [stack, setStack] = useState<Route[]>([{ p: initialTab, t: initialTab }]);
  const [users, setUsers] = useState<User[]>(USERS);
  const [me, setMe] = useState<User>(ME);
  const [books, setBooks] = useState<Book[]>(BOOKS);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [loans, setLoans] = useState<Loan[]>(LOANS);
  const [requestedBookIds, setRequestedBookIds] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const resetToDemoData = useCallback(() => {
    setUsers(USERS);
    setMe(ME);
    setBooks(BOOKS);
    setReviews(REVIEWS);
    setLoans(LOANS);
    setRequestedBookIds([]);
    setStack([{ p: "home", t: "home" }]);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1180px)");
    const handle = () => setIsDesktop(query.matches);
    handle();
    query.addEventListener("change", handle);
    return () => query.removeEventListener("change", handle);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });
        if (!response.ok) {
          if (cancelled) return;
          resetToDemoData();
          setIsDemoMode(true);
          return;
        }

        const json = (await response.json()) as { data?: ApiUser };
        const profile = json.data;

        if (!profile) {
          if (cancelled) return;
          resetToDemoData();
          setIsDemoMode(true);
          return;
        }

        const mappedBooks: Book[] = BOOKS.map((book) => ({
          ...book,
          owners: [...book.owners],
          status: { ...book.status }
        }));
        const mappedReviews = REVIEWS.map((review) => ({ ...review }));
        const mappedLoans = LOANS.map((loan) => ({ ...loan }));

        const userBooksResponse = await fetch(`/api/users/${profile.id}/books`, { cache: "no-store" });
        if (userBooksResponse.ok) {
          const userBooksJson = (await userBooksResponse.json()) as { data?: ApiUserBooksRow[] };
          for (const row of userBooksJson.data ?? []) {
            const base = Array.isArray(row.books) ? row.books[0] : row.books;
            if (!base) continue;

            const existing = mappedBooks.find((book) => book.id === base.id);
            if (existing) {
              if (!existing.owners.includes(profile.id)) {
                existing.owners = [...existing.owners, profile.id];
              }
              existing.status = { ...existing.status, [profile.id]: row.status };
              continue;
            }

            mappedBooks.push({
              id: base.id,
              title: base.title,
              author: base.author ?? "不明",
              publisher: base.publisher ?? "不明",
              genre: base.genre ?? [],
              pages: base.page_count ?? 0,
              owners: [profile.id],
              status: { [profile.id]: row.status },
              color: "#6b8f71"
            });
          }
        }

        const meBooks = mappedBooks.filter((book) => book.owners.includes(profile.id)).length;
        const meLent = mappedLoans.filter((loan) => loan.ownerId === profile.id && loan.status !== "rejected").length;
        const mappedMe: User = {
          id: profile.id,
          name: profile.display_name,
          avatar: toAvatarLabel(profile.display_name),
          bio: profile.bio ?? "プロフィールは未設定です。",
          location: profile.location ?? "未設定",
          books: meBooks,
          lent: meLent,
          color: "#6b8f71"
        };

        const mappedUsers = [mappedMe, ...USERS.filter((user) => user.id !== mappedMe.id)];

        if (cancelled) return;
        setUsers(mappedUsers);
        setMe(mappedMe);
        setBooks(mappedBooks);
        setReviews(mappedReviews);
        setLoans(mappedLoans);
        setIsDemoMode(false);
        setIsBooting(false);
      } catch {
        if (cancelled) return;
        resetToDemoData();
        setIsDemoMode(true);
      } finally {
        if (!cancelled) {
          setIsBooting(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [resetToDemoData]);

  const cur = stack[stack.length - 1];

  const go = useCallback((p: "book" | "user", id: string) => {
    setStack((prev) => [...prev, { p, id, t: prev[prev.length - 1].t }]);
  }, []);

  const back = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const tab = useCallback((t: MainTab) => {
    setStack([{ p: t, t }]);
  }, []);

  const handleRequest = useCallback(
    (bookId: string) => {
      if (requestedBookIds.includes(bookId)) return;
      const ownerId = books.find((b) => b.id === bookId)?.owners.find((id) => id !== me.id);
      if (!ownerId) return;

      const now = new Date().toISOString().slice(0, 10);
      setRequestedBookIds((prev) => [...prev, bookId]);
      setLoans((prev) => [
        {
          id: `l${prev.length + 1}`,
          bookId,
          ownerId,
          borrowerId: me.id,
          status: "requested",
          date: now,
          msg: "貸出希望です。よろしくお願いします。"
        },
        ...prev
      ]);
    },
    [books, me.id, requestedBookIds]
  );

  const handleLoanStatus = useCallback((loanId: string, status: LoanStatus) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    setLoans((prev) => prev.map((l) => (l.id === loanId ? { ...l, status } : l)));

    if (status === "active") {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === loan.bookId
            ? { ...b, status: { ...b.status, [loan.ownerId]: "lent_out" } }
            : b
        )
      );
    }

    if (status === "returned") {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === loan.bookId
            ? { ...b, status: { ...b.status, [loan.ownerId]: "available" } }
            : b
        )
      );
    }
  }, [loans]);

  const setUiMode = useCallback(
    (mode: UIMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "auto") {
        params.delete("ui");
      } else {
        params.set("ui", mode);
      }
      const qs = params.toString();
      router.replace((qs ? `${pathname}?${qs}` : pathname) as never, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const modeParam = searchParams.get("ui");
  const debugMode: UIMode = modeParam === "mobile" || modeParam === "web" ? modeParam : "auto";
  const effectiveMode: "mobile" | "web" = debugMode === "auto" ? (isDesktop ? "web" : "mobile") : debugMode;

  const pendingCount = loans.filter((l) => l.ownerId === me.id && l.status === "requested").length;

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    resetToDemoData();
    setIsDemoMode(true);
  }, [resetToDemoData]);

  if (isBooting) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--ink3)", fontFamily: "var(--sans)" }}>
          ログイン情報を確認しています...
        </div>
      </>
    );
  }

  const render = () => {
    switch (cur.p) {
      case "home":
        return <Home go={go} books={books} reviews={reviews} pendingCount={pendingCount} users={users} me={me} />;
      case "search":
        return <Search go={(p, id) => go(p, id)} books={books} reviews={reviews} />;
      case "shelf":
        return <Shelf go={(p, id) => go(p, id)} books={books} me={me} />;
      case "loans":
        return <Loans go={(p, id) => go(p, id)} books={books} users={users} me={me} loans={loans} onLoanStatus={handleLoanStatus} />;
      case "profile":
        return <Profile uid={me.id} go={(p, id) => go(p, id)} back={back} books={books} reviews={reviews} users={users} me={me} />;
      case "book":
        return (
          <BookDtl
            id={cur.id}
            go={(p, id) => go(p, id)}
            back={back}
            books={books}
            reviews={reviews}
            users={users}
            me={me}
            hasRequested={requestedBookIds.includes(cur.id)}
            onRequest={handleRequest}
          />
        );
      case "user":
        return <Profile uid={cur.id} go={(p, id) => go(p, id)} back={back} books={books} reviews={reviews} users={users} me={me} />;
      default:
        return <Home go={go} books={books} reviews={reviews} pendingCount={pendingCount} users={users} me={me} />;
    }
  };

  const routeKey = cur.p + ("id" in cur ? cur.id : "");
  const rendered = render();

  return (
    <>
      <style>{CSS}</style>
      <UiModeSwitcher mode={debugMode} onChange={setUiMode} />
      <div
        style={{
          position: "fixed",
          top: 58,
          right: 12,
          zIndex: 180,
          display: "flex",
          gap: 8,
          padding: 8,
          borderRadius: 10,
          background: "rgba(28,25,23,.72)",
          backdropFilter: "blur(10px)"
        }}
      >
        {isDemoMode ? (
          <>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.88)", alignSelf: "center", whiteSpace: "nowrap" }}>
              デモモード
            </span>
            <button
              onClick={() => router.push("/login")}
              style={{
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 8,
                padding: "7px 10px",
                color: "#1c1917",
                background: "#faf9f7"
              }}
            >
              ログイン
            </button>
            <button
              onClick={() => router.push("/invite")}
              style={{
                border: "1px solid rgba(255,255,255,.45)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 8,
                padding: "7px 10px",
                color: "#fff",
                background: "transparent"
              }}
            >
              新規登録
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/places")}
              style={{
                border: "1px solid rgba(255,255,255,.45)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 8,
                padding: "7px 10px",
                color: "#fff",
                background: "transparent"
              }}
            >
              場所
            </button>
            <button
              onClick={() => void handleLogout()}
              style={{
                border: "1px solid rgba(255,255,255,.45)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 8,
                padding: "7px 10px",
                color: "#fff",
                background: "transparent"
              }}
            >
              ログアウト
            </button>
          </>
        )}
      </div>

      {effectiveMode === "mobile" && (
        <PhoneShell routeKey={routeKey} rendered={rendered} currentTab={cur.t} onTab={tab} />
      )}

      {effectiveMode === "web" && (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 20% 10%, #f4efe6 0%, #e6e1d8 45%, #ded8ce 100%)" }}>
          <WebDesktopExperience
            cur={cur}
            users={users}
            me={me}
            books={books}
            reviews={reviews}
            loans={loans}
            go={go}
            back={back}
            switchTab={tab}
            onLoanStatus={handleLoanStatus}
            onRequest={handleRequest}
            requestedBookIds={requestedBookIds}
          />
        </div>
      )}
    </>
  );
}
