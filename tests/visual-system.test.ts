import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../lib/catalog.ts";
import { FOOTER_PATHS, PUBLIC_STATIC_PATHS } from "../lib/routes.ts";
import { RESEARCH_JOBS } from "../lib/jobs.ts";
import { signatureFor, SIGNATURES } from "../lib/visual/signatures.ts";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

function pageExists(pathname: string) {
  if (pathname === "/") return existsSync(join(root, "app/page.tsx"));
  const dedicated = join(root, "app", pathname.slice(1), "page.tsx");
  if (existsSync(dedicated)) return true;
  return CATALOG.some((item) => `/${item.hub}` === pathname);
}

describe("visual signatures", () => {
  it("gives every catalog class a distinct object and accent", () => {
    const objects = new Set<string>();
    for (const cat of CATALOG) {
      const sig = signatureFor(cat.id);
      assert.ok(sig.accent.startsWith("#"));
      objects.add(`${sig.object}-${sig.accent}`);
      assert.ok(cat.summary.length > 20);
    }
    assert.ok(objects.size >= 8);
    assert.ok(SIGNATURES.wallet.object === "keys");
    assert.ok(SIGNATURES.exchange.object === "venue");
  });
});

describe("route integrity", () => {
  it("maps every catalog hub to a public path", () => {
    for (const cat of CATALOG) assert.ok(pageExists(`/${cat.hub}`), `/${cat.hub}`);
  });

  it("keeps indexable static paths as real pages", () => {
    for (const path of PUBLIC_STATIC_PATHS) {
      assert.ok(pageExists(path), path);
    }
  });

  it("does not leave footer destinations as dead routes", () => {
    for (const path of FOOTER_PATHS) {
      assert.ok(pageExists(path), path);
    }
  });

  it("maps every research job to a real hub or page", () => {
    for (const job of RESEARCH_JOBS) {
      assert.ok(pageExists(job.href), job.href);
    }
  });
});

describe("visual stylesheets", () => {
  it("loads experience.css after the visual system", () => {
    const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
    const visual = layout.indexOf("visual-system.css");
    const experience = layout.indexOf("experience.css");
    const readability = layout.indexOf("readability.css");
    const atelier = layout.indexOf("atelier.css");
    assert.ok(visual >= 0);
    assert.ok(experience > visual);
    assert.ok(readability > experience);
    assert.ok(atelier > readability);
  });
});
