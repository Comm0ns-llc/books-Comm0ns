"use client";

import { type CSSProperties, type ReactNode, useMemo, useState } from "react";

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

type Route =
  | { p: "home" | "search" | "shelf" | "loans" | "profile"; t: "home" | "search" | "shelf" | "loans" | "profile" }
  | { p: "book"; id: string; t: "home" | "search" | "shelf" | "loans" | "profile" }
  | { p: "user"; id: string; t: "home" | "search" | "shelf" | "loans" | "profile" };

function Stars({ n, sz = 12 }: { n: number; sz?: number }) {
  return (
    <span style={{ letterSpacing: 2, fontSize: sz, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= n ? "var(--w)" : "var(--i5)" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function Pill({
  children,
  c = "var(--i3)",
  bg = "var(--b3)"
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
        letterSpacing: 0.3,
        lineHeight: "16px",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </span>
  );
}

const statusMap: Record<BookStatus, { l: string; c: string; b: string }> = {
  available: { l: "貸出可", c: "var(--g)", b: "var(--gb)" },
  lent_out: { l: "貸出中", c: "var(--w)", b: "var(--wb)" },
  private: { l: "非公開", c: "var(--i4)", b: "var(--b3)" },
  reading: { l: "読書中", c: "var(--bl)", b: "var(--blb)" }
};

function StatusPill({ s }: { s: BookStatus }) {
  const m = statusMap[s];
  return <Pill c={m.c} bg={m.b}>{m.l}</Pill>;
}

function Avatar({ u, sz = 36 }: { u: User; sz?: number }) {
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
        letterSpacing: 1
      }}
    >
      {u.avatar}
    </div>
  );
}

function BookCover({ b, sz = 56 }: { b: Book; sz?: number }) {
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
        boxShadow: "2px 4px 12px rgba(0,0,0,.12), inset -2px 0 6px rgba(255,255,255,.08)",
        cursor: "pointer",
        transition: "transform .2s, box-shadow .2s"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "3px 8px 20px rgba(0,0,0,.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "2px 4px 12px rgba(0,0,0,.12),inset -2px 0 6px rgba(255,255,255,.08)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,.12) 0%, transparent 40%, rgba(0,0,0,.15) 100%)"
        }}
      />
      <span
        style={{
          fontSize: Math.max(9, sz * 0.16),
          color: "rgba(255,255,255,.9)",
          fontFamily: "var(--se)",
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

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--i4)" }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--i2)", letterSpacing: 1.5, marginBottom: 16 }}>{children}</h2>;
}

function Card({
  children,
  onClick,
  style,
  hover = true
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  hover?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 18,
        background: "var(--b2)",
        borderRadius: "var(--r)",
        border: "1px solid var(--b3)",
        cursor: onClick ? "pointer" : "default",
        transition: "all var(--t)",
        ...style
      }}
      onMouseEnter={
        hover && onClick
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--i5)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.04)";
            }
          : undefined
      }
      onMouseLeave={
        hover && onClick
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--b3)";
              e.currentTarget.style.boxShadow = "none";
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

function Sidebar({
  cur,
  set,
  noti,
  me,
}: {
  cur: Route["t"];
  set: (t: Route["t"]) => void;
  noti: number;
  me: User;
}) {
  const items = [
    { id: "home", label: "ホーム", path: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
    { id: "search", label: "検索", path: "M11 3a8 8 0 100 16 8 8 0 000-16z M21 21l-4.35-4.35" },
    { id: "shelf", label: "マイ本棚", path: "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
    { id: "loans", label: "貸出管理", path: "M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3" }
  ] as const;

  return (
    <aside style={{ width: 240, height: "100vh", position: "sticky", top: 0, background: "var(--b)", borderRight: "1px solid var(--b3)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
      <div style={{ padding: "28px 24px 32px", borderBottom: "1px solid var(--b3)" }}>
        <div style={{ fontFamily: "var(--se)", fontSize: 20, fontWeight: 800, color: "var(--i)", letterSpacing: 1 }}>本のコモンズ</div>
        <div style={{ fontSize: 11, color: "var(--i4)", marginTop: 4, fontWeight: 300 }}>分散型ライブラリ</div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {items.map((it) => {
          const active = cur === it.id;
          return (
            <button key={it.id} onClick={() => set(it.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", border: "none", borderRadius: 10, cursor: "pointer", background: active ? "var(--i)" : "transparent", color: active ? "#fff" : "var(--i3)", fontSize: 13, fontWeight: active ? 600 : 400, transition: "all var(--t)", marginBottom: 4, position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {it.path.split(" M").map((seg, idx) => <path key={seg + idx} d={(idx > 0 ? "M" : "") + seg} />)}
              </svg>
              {it.label}
              {it.id === "loans" && noti > 0 && (
                <span style={{ position: "absolute", right: 12, width: 18, height: 18, borderRadius: "50%", background: active ? "var(--w)" : "var(--rd)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {noti}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div onClick={() => set("profile")} style={{ padding: "16px 20px", borderTop: "1px solid var(--b3)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: cur === "profile" ? "var(--b2)" : "transparent", transition: "background var(--t)" }}>
        <Avatar u={me} sz={36} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--i)" }}>{me.name}</div>
          <div style={{ fontSize: 11, color: "var(--i4)" }}>{me.books}冊</div>
        </div>
      </div>
    </aside>
  );
}

function PageHome({
  go,
  books,
  reviews,
  loans,
  users,
  me,
  onLoanStatus
}: {
  go: (p: "book" | "user", id: string) => void;
  books: Book[];
  reviews: Review[];
  loans: Loan[];
  users: User[];
  me: User;
  onLoanStatus: (loanId: string, status: LoanStatus) => void;
}) {
  const recent = [...reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const activeLoans = loans.filter((l) => l.status === "active" || l.status === "requested");

  return (
    <div style={{ animation: "fi .3s ease-out" }}>
      <div style={{ padding: "36px 40px 32px", borderBottom: "1px solid var(--b3)", background: "linear-gradient(135deg, var(--b) 0%, var(--b2) 100%)" }}>
        <p style={{ fontSize: 14, color: "var(--i4)", fontWeight: 300, marginBottom: 6 }}>おはよう、{me.name.split(" ")[1]}さん</p>
        <h1 style={{ fontSize: 28, color: "var(--i)", fontFamily: "var(--se)", fontWeight: 700, lineHeight: 1.5, letterSpacing: 0.5 }}>
          <span style={{ color: "var(--w)", fontWeight: 800 }}>{books.length}</span>冊の本がコミュニティで共有されています
        </h1>
      </div>

      <div style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 40 }}>
        <div>
          <div style={{ marginBottom: 40 }}>
            <SectionTitle>すべての本</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 20 }}>
              {books.map((b, i) => (
                <div key={b.id} onClick={() => go("book", b.id)} style={{ textAlign: "center", cursor: "pointer", animation: `su .4s ease-out ${i * 0.04}s both` }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><BookCover b={b} sz={80} /></div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</p>
                  <p style={{ fontSize: 11, color: "var(--i4)", fontWeight: 300 }}>{b.author}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>最新の感想</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {recent.map((r, i) => {
                const bk = books.find((x) => x.id === r.bookId);
                const u = users.find((x) => x.id === r.userId);
                if (!bk || !u) return null;
                return (
                  <Card key={r.id} onClick={() => go("book", r.bookId)} style={{ animation: `su .4s ease-out ${i * 0.06}s both` }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <BookCover b={bk} sz={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)", marginBottom: 2 }}>{bk.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Avatar u={u} sz={16} />
                          <span style={{ fontSize: 11, color: "var(--i3)" }}>{u.name}</span>
                          <Stars n={r.rating} sz={10} />
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--i3)", lineHeight: 1.7, fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.body}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>アクティブな貸出</SectionTitle>
            {activeLoans.length === 0 && <p style={{ fontSize: 13, color: "var(--i4)" }}>アクティブな貸出はありません</p>}
            {activeLoans.map((loan, i) => {
              const bk = books.find((x) => x.id === loan.bookId);
              const other = users.find((x) => x.id === (loan.ownerId === me.id ? loan.borrowerId : loan.ownerId));
              if (!bk || !other) return null;
              const isOwner = loan.ownerId === me.id;

              return (
                <Card key={loan.id} style={{ marginBottom: 10, animation: `su .3s ease-out ${i * 0.06}s both` }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <BookCover b={bk} sz={36} />
                    <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => go("book", loan.bookId)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)" }}>{bk.title}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: loan.status === "requested" ? "var(--w)" : "var(--g)" }}>
                          {loan.status === "requested" ? "⏳ リクエスト中" : "● 貸出中"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Avatar u={other} sz={16} />
                        <span style={{ fontSize: 11, color: "var(--i3)" }}>{isOwner ? `${other.name} に貸出` : `${other.name} から借用`}</span>
                      </div>
                    </div>
                  </div>
                  {loan.status === "requested" && isOwner && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={(e) => { e.stopPropagation(); onLoanStatus(loan.id, "approved"); }} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: "var(--rs)", background: "var(--i)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>承認</button>
                      <button onClick={(e) => { e.stopPropagation(); onLoanStatus(loan.id, "rejected"); }} style={{ flex: 1, padding: "8px 0", border: "1px solid var(--b3)", borderRadius: "var(--rs)", background: "var(--b)", color: "var(--i3)", fontSize: 12, cursor: "pointer" }}>拒否</button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div>
            <SectionTitle>メンバー</SectionTitle>
            {users.map((u) => (
              <div key={u.id} onClick={() => go("user", u.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, cursor: "pointer", transition: "background var(--t)", marginBottom: 4 }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--b2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Avatar u={u} sz={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--i)" }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "var(--i4)" }}>{u.location} · {u.books}冊</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageSearch({ go, books, reviews }: { go: (p: "book", id: string) => void; books: Book[]; reviews: Review[] }) {
  const [q, sQ] = useState("");
  const [g, sG] = useState("all");
  const genres = ["all", "文学", "SF", "ノンフィクション", "古典", "哲学", "現代小説", "児童文学", "歴史", "自己啓発"];

  const results = useMemo(() => books.filter((b) => {
    const mq = !q || b.title.includes(q) || b.author.includes(q);
    const mg = g === "all" || b.genre.includes(g);
    return mq && mg;
  }), [books, g, q]);

  return (
    <div style={{ animation: "fi .3s ease-out" }}>
      <div style={{ padding: "28px 40px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--i)", fontFamily: "var(--se)", letterSpacing: 0.5, marginBottom: 20 }}>検索</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "var(--b2)", borderRadius: "var(--r)", border: "1px solid var(--b3)", maxWidth: 560, marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--i4)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input value={q} onChange={(e) => sQ(e.target.value)} placeholder="タイトル・著者名で検索" style={{ border: "none", background: "none", flex: 1, outline: "none", fontSize: 15, color: "var(--i)" }} />
          {q && <span onClick={() => sQ("")} style={{ cursor: "pointer", color: "var(--i4)", fontSize: 16 }}>✕</span>}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {genres.map((x) => (
            <button key={x} onClick={() => sG(x)} style={{ border: g === x ? "1.5px solid var(--i)" : "1px solid var(--b3)", background: g === x ? "var(--i)" : "var(--b)", color: g === x ? "#fff" : "var(--i3)", borderRadius: 20, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: g === x ? 600 : 400, transition: "all var(--t)" }}>{x === "all" ? "すべて" : x}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 40px 40px" }}>
        <p style={{ fontSize: 12, color: "var(--i4)", marginBottom: 16 }}>{results.length}件</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {results.map((b, i) => {
            const rv = reviews.filter((r) => r.bookId === b.id);
            const avg = rv.length ? rv.reduce((s, r) => s + r.rating, 0) / rv.length : 0;
            const ac = Object.values(b.status).filter((s) => s === "available").length;
            return (
              <Card key={b.id} onClick={() => go("book", b.id)} style={{ display: "flex", gap: 16, animation: `su .3s ease-out ${i * 0.03}s both` }}>
                <BookCover b={b} sz={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)", marginBottom: 3 }}>{b.title}</p>
                  <p style={{ fontSize: 12, color: "var(--i4)", fontWeight: 300, marginBottom: 8 }}>{b.author} · {b.publisher}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {rv.length > 0 && <Stars n={Math.round(avg)} sz={10} />}
                    {rv.length > 0 && <span style={{ fontSize: 11, color: "var(--i4)" }}>({rv.length})</span>}
                    {ac > 0 && <Pill c="var(--g)" bg="var(--gb)">{ac}冊 貸出可</Pill>}
                    {b.genre.slice(0, 2).map((x) => <Pill key={x}>{x}</Pill>)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {results.length === 0 && <Empty icon="📭" text="該当する本が見つかりません" />}
      </div>
    </div>
  );
}

function PageShelf({ go, books, me }: { go: (p: "book", id: string) => void; books: Book[]; me: User }) {
  const [addOpen, sA] = useState(false);
  const my = books.filter((b) => b.owners.includes(me.id));
  const stats = [
    { n: my.length, l: "所有", c: "var(--i)" },
    { n: my.filter((b) => b.status[me.id] === "available").length, l: "貸出可", c: "var(--g)" },
    { n: my.filter((b) => b.status[me.id] === "lent_out").length, l: "貸出中", c: "var(--w)" },
    { n: my.filter((b) => b.status[me.id] === "reading").length, l: "読書中", c: "var(--bl)" }
  ];

  return (
    <div style={{ padding: "28px 40px 40px", animation: "fi .3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--i)", fontFamily: "var(--se)", letterSpacing: 0.5 }}>マイ本棚</h1>
        <button onClick={() => sA(!addOpen)} style={{ border: addOpen ? "none" : "1.5px solid var(--i)", background: addOpen ? "var(--i)" : "transparent", color: addOpen ? "#fff" : "var(--i)", borderRadius: 20, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "all var(--t)" }}>{addOpen ? "✕ 閉じる" : "＋ 本を追加"}</button>
      </div>

      {addOpen && (
        <div style={{ padding: 24, background: "var(--wb)", borderRadius: "var(--r)", border: "1px solid rgba(194,163,110,.2)", marginBottom: 24, animation: "si .2s ease-out" }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--i)" }}>本を追加</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ padding: "12px 24px", border: "2px dashed var(--w)", borderRadius: "var(--rs)", background: "rgba(250,245,235,.6)", cursor: "pointer", fontSize: 13, color: "var(--w)", fontWeight: 600, whiteSpace: "nowrap" }}>📷 バーコードスキャン</button>
            <input placeholder="ISBN を入力" style={{ flex: 1, padding: "12px 16px", border: "1px solid var(--b3)", borderRadius: "var(--rs)", fontSize: 14, outline: "none", background: "var(--b)" }} />
            <button style={{ padding: "12px 24px", border: "none", borderRadius: "var(--rs)", background: "var(--i)", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>検索</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {stats.map((s) => (
          <div key={s.l} style={{ flex: 1, textAlign: "center", padding: "20px 0", background: "var(--b2)", borderRadius: "var(--r)", border: "1px solid var(--b3)" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.c, fontFamily: "var(--se)", lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "var(--i4)", marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 24 }}>
        {my.map((b, i) => (
          <div key={b.id} onClick={() => go("book", b.id)} style={{ textAlign: "center", cursor: "pointer", animation: `su .35s ease-out ${i * 0.05}s both` }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><BookCover b={b} sz={80} /></div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</p>
            <StatusPill s={b.status[me.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PageBook({ id, go, back, books, reviews, users, me, hasRequested, onRequest }: {
  id: string;
  go: (p: "user", id: string) => void;
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

  return (
    <div style={{ padding: "28px 40px 40px", animation: "fi .3s ease-out" }}>
      <button onClick={back} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--i3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, padding: 0 }}><span style={{ fontSize: 18 }}>←</span> 戻る</button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40 }}>
        <div>
          <div style={{ display: "flex", gap: 28, marginBottom: 36, padding: 28, background: `linear-gradient(135deg, ${b.color}06 0%, var(--b2) 100%)`, borderRadius: "var(--r)", border: "1px solid var(--b3)" }}>
            <BookCover b={b} sz={120} />
            <div style={{ flex: 1, paddingTop: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--i)", fontFamily: "var(--se)", lineHeight: 1.4, marginBottom: 6, letterSpacing: 0.5 }}>{b.title}</h1>
              <p style={{ fontSize: 15, color: "var(--i3)", fontWeight: 300, marginBottom: 4 }}>{b.author}</p>
              <p style={{ fontSize: 12, color: "var(--i4)", marginBottom: 16 }}>{b.publisher} · {b.pages}ページ</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
                {avg && <Stars n={Math.round(parseFloat(avg))} sz={14} />}
                {avg && <span style={{ fontSize: 16, fontWeight: 700, color: "var(--w)", fontFamily: "var(--se)" }}>{avg}</span>}
                {b.genre.map((x) => <Pill key={x}>{x}</Pill>)}
              </div>
              {!b.owners.includes(me.id) && (
                <button onClick={() => onRequest(id)} disabled={hasRequested} style={{ padding: "12px 36px", border: "none", borderRadius: "var(--rs)", background: hasRequested ? "var(--gb)" : "var(--i)", color: hasRequested ? "var(--g)" : "#fff", fontSize: 14, fontWeight: 700, cursor: hasRequested ? "default" : "pointer", transition: "all .3s", letterSpacing: 0.5 }}>{hasRequested ? "✓ リクエスト送信済み" : "貸出をリクエスト"}</button>
              )}
            </div>
          </div>

          <SectionTitle>感想 ({rv.length})</SectionTitle>
          {rv.length === 0 && <Empty icon="💬" text="まだ感想がありません" />}
          {rv.map((r, i) => {
            const u = users.find((x) => x.id === r.userId);
            if (!u) return null;
            return (
              <div key={r.id} style={{ padding: "20px 0", borderBottom: i < rv.length - 1 ? "1px solid var(--b3)" : "none", animation: `su .3s ease-out ${i * 0.08}s both` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Avatar u={u} sz={32} />
                  <span onClick={() => go("user", u.id)} style={{ fontSize: 14, fontWeight: 500, color: "var(--i2)", cursor: "pointer" }}>{u.name}</span>
                  <Stars n={r.rating} sz={12} />
                  <span style={{ fontSize: 12, color: "var(--i5)", marginLeft: "auto" }}>{r.date}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--i2)", lineHeight: 1.8, fontWeight: 300 }}>{r.body}</p>
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ position: "sticky", top: 28 }}>
            <Card hover={false} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--i2)", letterSpacing: 1, marginBottom: 16 }}>書籍情報</h3>
              {[
                { l: "ISBN", v: "978-4-10-010001-4" },
                { l: "ページ数", v: `${b.pages}p` },
                { l: "出版社", v: b.publisher },
                { l: "所有者数", v: `${ow.length}人` }
              ].map((x) => (
                <div key={x.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--b3)" }}>
                  <span style={{ fontSize: 12, color: "var(--i4)" }}>{x.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--i)" }}>{x.v}</span>
                </div>
              ))}
            </Card>

            <Card hover={false}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--i2)", letterSpacing: 1, marginBottom: 16 }}>所有者 ({ow.length})</h3>
              {ow.map((u, i) => (
                <div key={u.id} onClick={() => go("user", u.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < ow.length - 1 ? "1px solid var(--b3)" : "none", cursor: "pointer" }}>
                  <Avatar u={u} sz={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--i)" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "var(--i4)" }}>{u.location}</div>
                  </div>
                  <StatusPill s={b.status[u.id]} />
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageLoans({ go, loans, books, users, me, onLoanStatus }: {
  go: (p: "book", id: string) => void;
  loans: Loan[];
  books: Book[];
  users: User[];
  me: User;
  onLoanStatus: (loanId: string, status: LoanStatus) => void;
}) {
  const lending = loans.filter((l) => l.ownerId === me.id);
  const borrowing = loans.filter((l) => l.borrowerId === me.id);

  const statusIcon: Record<LoanStatus, string> = { requested: "⏳", approved: "✓", active: "●", returned: "✓✓", rejected: "✕" };
  const statusLabel: Record<LoanStatus, string> = { requested: "リクエスト中", approved: "承認済", active: "貸出中", returned: "返却済", rejected: "拒否" };
  const statusColor: Record<LoanStatus, string> = { requested: "var(--w)", approved: "var(--bl)", active: "var(--g)", returned: "var(--i4)", rejected: "var(--rd)" };

  function renderList(list: Loan[], isOwner: boolean) {
    if (list.length === 0) return <Empty icon={isOwner ? "📤" : "📥"} text={isOwner ? "貸出中の本はありません" : "借用中の本はありません"} />;

    return list.map((loan, i) => {
      const bk = books.find((x) => x.id === loan.bookId);
      const other = users.find((u) => u.id === (isOwner ? loan.borrowerId : loan.ownerId));
      if (!bk || !other) return null;
      return (
        <Card key={loan.id} onClick={() => go("book", loan.bookId)} style={{ display: "flex", gap: 14, marginBottom: 10, animation: `su .3s ease-out ${i * 0.06}s both` }}>
          <BookCover b={bk} sz={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)" }}>{bk.title}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[loan.status], whiteSpace: "nowrap" }}>{statusIcon[loan.status]} {statusLabel[loan.status]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Avatar u={other} sz={20} />
              <span style={{ fontSize: 12, color: "var(--i3)" }}>{isOwner ? `${other.name} に貸出` : `${other.name} から借用`}</span>
            </div>
            {loan.msg && <p style={{ fontSize: 12, color: "var(--i4)", fontStyle: "italic", marginTop: 4 }}>「{loan.msg}」</p>}
            {loan.status === "requested" && isOwner && (
              <div style={{ display: "flex", gap: 8, marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => { e.stopPropagation(); onLoanStatus(loan.id, "approved"); }} style={{ padding: "9px 28px", border: "none", borderRadius: "var(--rs)", background: "var(--i)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>承認</button>
                <button onClick={(e) => { e.stopPropagation(); onLoanStatus(loan.id, "rejected"); }} style={{ padding: "9px 28px", border: "1px solid var(--b3)", borderRadius: "var(--rs)", background: "var(--b)", color: "var(--i3)", fontSize: 12, cursor: "pointer" }}>拒否</button>
              </div>
            )}
            {loan.status === "active" && isOwner && (
              <button onClick={(e) => { e.stopPropagation(); onLoanStatus(loan.id, "returned"); }} style={{ padding: "9px 28px", marginTop: 14, border: "1.5px solid var(--g)", borderRadius: "var(--rs)", background: "var(--gb)", color: "var(--g)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>返却を確認</button>
            )}
          </div>
        </Card>
      );
    });
  }

  return (
    <div style={{ padding: "28px 40px 40px", animation: "fi .3s ease-out" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--i)", fontFamily: "var(--se)", letterSpacing: 0.5, marginBottom: 28 }}>貸出管理</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div><SectionTitle>貸している</SectionTitle>{renderList(lending, true)}</div>
        <div><SectionTitle>借りている</SectionTitle>{renderList(borrowing, false)}</div>
      </div>
    </div>
  );
}

function PageProfile({ uid, go, back, books, reviews, users, me }: {
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
  const uBooks = books.filter((b) => b.owners.includes(u.id));
  const uRevs = reviews.filter((r) => r.userId === u.id);

  return (
    <div style={{ padding: "28px 40px 40px", animation: "fi .3s ease-out" }}>
      {!isMe && <button onClick={back} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--i3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, padding: 0 }}><span style={{ fontSize: 18 }}>←</span> 戻る</button>}

      <div style={{ display: "flex", gap: 28, padding: 32, background: `linear-gradient(135deg, ${u.color}06 0%, var(--b2) 100%)`, borderRadius: "var(--r)", border: "1px solid var(--b3)", marginBottom: 32 }}>
        <Avatar u={u} sz={80} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--i)", fontFamily: "var(--se)", letterSpacing: 1, marginBottom: 4 }}>{u.name}</h1>
          <p style={{ fontSize: 12, color: "var(--i4)", marginBottom: 10 }}>📍 {u.location}</p>
          <p style={{ fontSize: 14, color: "var(--i3)", fontWeight: 300, lineHeight: 1.7, marginBottom: 20, maxWidth: 400 }}>{u.bio}</p>
          <div style={{ display: "flex", gap: 32 }}>
            {[{ n: u.books, l: "蔵書" }, { n: u.lent, l: "貸出" }, { n: uRevs.length, l: "感想" }].map((s) => (
              <div key={s.l}><span style={{ fontSize: 24, fontWeight: 700, color: "var(--i)", fontFamily: "var(--se)" }}>{s.n}</span><span style={{ fontSize: 12, color: "var(--i4)", marginLeft: 6 }}>{s.l}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <SectionTitle>本棚 ({uBooks.length})</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 20 }}>
            {uBooks.map((b, i) => (
              <div key={b.id} onClick={() => go("book", b.id)} style={{ textAlign: "center", cursor: "pointer", animation: `su .3s ease-out ${i * 0.05}s both` }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><BookCover b={b} sz={64} /></div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</p>
                <StatusPill s={b.status[u.id]} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>感想 ({uRevs.length})</SectionTitle>
          {uRevs.length === 0 && <Empty icon="💬" text="まだ感想がありません" />}
          {uRevs.map((r, i) => {
            const bk = books.find((x) => x.id === r.bookId);
            if (!bk) return null;
            return (
              <div key={r.id} onClick={() => go("book", r.bookId)} style={{ display: "flex", gap: 12, padding: "16px 0", borderBottom: "1px solid var(--b3)", cursor: "pointer", animation: `su .3s ease-out ${i * 0.06}s both` }}>
                <BookCover b={bk} sz={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--i)", fontFamily: "var(--se)" }}>{bk.title}</span>
                    <Stars n={r.rating} sz={11} />
                  </div>
                  <p style={{ fontSize: 13, color: "var(--i3)", lineHeight: 1.7, fontWeight: 300 }}>{r.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WebDesktopExperience({
  cur,
  users,
  me,
  books,
  reviews,
  loans,
  go,
  back,
  switchTab,
  onLoanStatus,
  onRequest,
  requestedBookIds
}: {
  cur: Route;
  users: User[];
  me: User;
  books: Book[];
  reviews: Review[];
  loans: Loan[];
  go: (p: "book" | "user", id: string) => void;
  back: () => void;
  switchTab: (t: Route["t"]) => void;
  onLoanStatus: (loanId: string, status: LoanStatus) => void;
  onRequest: (bookId: string) => void;
  requestedBookIds: string[];
}) {
  const pendingLoans = loans.filter((l) => l.ownerId === me.id && l.status === "requested").length;

  const renderPage = () => {
    switch (cur.p) {
      case "home":
        return <PageHome go={go} books={books} reviews={reviews} loans={loans} users={users} me={me} onLoanStatus={onLoanStatus} />;
      case "search":
        return <PageSearch go={(p, id) => go(p, id)} books={books} reviews={reviews} />;
      case "shelf":
        return <PageShelf go={(p, id) => go(p, id)} books={books} me={me} />;
      case "loans":
        return <PageLoans go={(p, id) => go(p, id)} loans={loans} books={books} users={users} me={me} onLoanStatus={onLoanStatus} />;
      case "profile":
        return <PageProfile uid={me.id} go={(p, id) => go(p, id)} back={back} books={books} reviews={reviews} users={users} me={me} />;
      case "book":
        return <PageBook id={cur.id} go={(p, id) => go(p, id)} back={back} books={books} reviews={reviews} users={users} me={me} hasRequested={requestedBookIds.includes(cur.id)} onRequest={onRequest} />;
      case "user":
        return <PageProfile uid={cur.id} go={(p, id) => go(p, id)} back={back} books={books} reviews={reviews} users={users} me={me} />;
      default:
        return <PageHome go={go} books={books} reviews={reviews} loans={loans} users={users} me={me} onLoanStatus={onLoanStatus} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--b)", maxWidth: 1280, margin: "0 auto", boxShadow: "0 0 80px rgba(28,25,23,.06)" }}>
      <Sidebar cur={cur.t} set={switchTab} noti={pendingLoans} me={me} />
      <main style={{ flex: 1, minHeight: "100vh", overflowY: "auto" }} key={cur.p + ("id" in cur ? cur.id : "")}>{renderPage()}</main>
    </div>
  );
}
