import Link from "next/link";
import type { Route } from "next";

const links: Array<{ href: Route; label: string }> = [
  { href: "/", label: "ホーム" },
  { href: "/search", label: "検索" },
  { href: "/shelf", label: "本棚" },
  { href: "/loans", label: "貸出" },
  { href: "/profile", label: "プロフィール" }
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur">
      <ul className="mx-auto grid max-w-3xl grid-cols-5 text-center text-xs">
        {links.map((item) => (
          <li key={item.href}>
            <Link className="block px-2 py-3" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
