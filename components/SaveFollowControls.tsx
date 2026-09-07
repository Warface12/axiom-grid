"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function SaveFollowControls({ platformId, slug, kind }: { platformId?: string; slug: string; kind: string }) {
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch("/api/account/me", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      setSignedIn(Boolean(j.user?.email));
      setSaved((j.items || []).some((item: { item_id: string }) => item.item_id === (platformId || slug)));
      setFollowing((j.follows || []).some((item: { platform_id: string }) => item.platform_id === platformId));
    });
  }, [platformId, slug]);

  async function post(payload: object) {
    const r = await fetch("/api/account/me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (r.status === 401) return;
    if (payload && "save" in payload) setSaved(true);
    if (payload && "unsave" in payload) setSaved(false);
    if (payload && "follow" in payload) setFollowing(true);
    if (payload && "unfollow" in payload) setFollowing(false);
  }

  if (!signedIn) {
    return <p className="tp-muted"><Link href="/account">Sign in</Link> to save this profile or follow the company.</p>;
  }

  return (
    <div className="empty-actions" style={{ marginTop: 16 }}>
      <button type="button" className="primary-btn" onClick={() => post(saved ? { unsave: { item_type: "product", item_id: platformId || slug } } : { save: { item_type: "product", item_id: platformId || slug, kind } })}>
        {saved ? "Saved" : "Save product"}
      </button>
      {platformId ? (
        <button type="button" onClick={() => post(following ? { unfollow: { platform_id: platformId } } : { follow: { platform_id: platformId } })}>
          {following ? "Following" : "Follow company"}
        </button>
      ) : null}
    </div>
  );
}
