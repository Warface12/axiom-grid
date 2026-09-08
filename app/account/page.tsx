import { buildMetadata } from "@/lib/seo";
import { AccountClient } from "@/components/AccountClient";

export const metadata = buildMetadata({
  title: "Your TopPick account",
  description: "Save products, follow companies, manage notifications and keep your TopPick account in one place.",
  path: "/account",
  noIndex: true,
});

const benefits = [
  { t: "Save", d: "Keep products you are researching, without losing the comparison context." },
  { t: "Follow", d: "Watch a company page so updates land in one place." },
  { t: "Watch", d: "Mark opportunities you want to revisit when terms are clear." },
  { t: "Compare", d: "Return to like-with-like tables instead of starting from ads." },
  { t: "Notifications", d: "Choose what you hear about — products, research, or nothing extra." },
  { t: "Continuity", d: "The same saved set on desktop and phone." },
];

export default function Page() {
  return (
    <main className="tp-account-split">
      <section className="tp-account-form" aria-label="Sign in">
        <p className="tp-kicker">User account</p>
        <h1>Sign in to your TopPick</h1>
        <p className="tp-lead">This is a personal account for saving and alerts. It cannot open Admin or a company workspace.</p>
        <AccountClient />
      </section>
      <section className="tp-account-value">
        <p className="tp-kicker">Why it exists</p>
        <h2>Carry the research with you.</h2>
        <p>An account is for saving, following and alerts. Partner applications use a different door.</p>
        <ul className="tp-account-benefits">
          {benefits.map((item) => (
            <li key={item.t}><b>{item.t}</b><span>{item.d}</span></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
