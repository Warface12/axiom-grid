import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { isPrivateIp, parsePublicHttpUrl } from "@/lib/httpUrl";

export type SafeFetchResult = {
  finalUrl: string;
  status: number;
  contentType: string;
  body: string;
};

async function assertHostSafe(hostname: string) {
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Private or reserved network addresses are blocked.");
    return;
  }
  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length) throw new Error("The host could not be resolved.");
  for (const record of records) {
    if (isPrivateIp(record.address)) throw new Error("The host resolves to a private or reserved address.");
  }
}

export async function safePublicFetch(input: string, options?: { maxRedirects?: number; timeoutMs?: number; maxBytes?: number }): Promise<SafeFetchResult> {
  const maxRedirects = options?.maxRedirects ?? 3;
  const timeoutMs = options?.timeoutMs ?? 8000;
  const maxBytes = options?.maxBytes ?? 1_500_000;
  let current = input;

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const parsed = parsePublicHttpUrl(current);
    if (!parsed.ok) throw new Error(parsed.error);
    await assertHostSafe(parsed.host);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(parsed.url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent": "TopPickResearchBot/1.0 (+https://toppick.pro/editorial-policy)",
        },
      });
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof Error && error.name === "AbortError") throw new Error("The request timed out.");
      throw new Error("The URL could not be retrieved.");
    }
    clearTimeout(timer);

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect was missing a destination.");
      current = new URL(location, parsed.url).toString();
      continue;
    }

    if (!response.ok) throw new Error(`The remote site responded with HTTP ${response.status}.`);
    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > maxBytes) throw new Error("The remote response is too large.");
    return {
      finalUrl: parsed.url.toString(),
      status: response.status,
      contentType,
      body: buffer.toString("utf8"),
    };
  }

  throw new Error("Too many redirects.");
}
