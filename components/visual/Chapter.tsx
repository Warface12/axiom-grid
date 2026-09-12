import type { ReactNode } from "react";

export function Chapter({
  id,
  tone,
  kicker,
  title,
  lead,
  children,
  aside,
}: {
  id?: string;
  tone: string;
  kicker: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section id={id} className={`tp-chapter tp-chapter--${tone}`}>
      <div className="tp-chapter-inner">
        <header className="tp-chapter-copy">
          <p className="tp-kicker">{kicker}</p>
          <h2>{title}</h2>
          {lead ? <p className="tp-lead">{lead}</p> : null}
        </header>
        {aside ? <div className="tp-chapter-aside">{aside}</div> : null}
        {children ? <div className="tp-chapter-body">{children}</div> : null}
      </div>
    </section>
  );
}
