import Link from "next/link";
import { Compass, GitCompare, Home, Search, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/#universe", label: "Discover", Icon: Compass },
  { href: "/compare", label: "Compare", Icon: GitCompare },
  { href: "/finder", label: "Finder", Icon: Search },
  { href: "/account", label: "Account", Icon: UserRound },
];

export function AppDock() {
  return (
    <nav className="tp-dock" aria-label="Mobile shortcuts">
      {ITEMS.map((item) => (
        <Link key={item.href} href={item.href}>
          <item.Icon size={20} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
