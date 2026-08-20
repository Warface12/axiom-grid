import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { assertPublicUrl } from "./net";

function extensionFor(contentType: string, url: string) {
  const type = contentType.toLowerCase();
  if (type.includes("image/png")) return "png";
  if (type.includes("image/jpeg")) return "jpg";
  if (type.includes("image/webp")) return "webp";
  if (type.includes("image/svg")) return "svg";
  if (type.includes("image/gif")) return "gif";
  const ext = new URL(url).pathname.split(".").pop()?.toLowerCase();
  return ext && ["png","jpg","jpeg","webp","svg","gif"].includes(ext) ? ext.replace("jpeg","jpg") : "png";
}

export async function cacheCasinoLogo(casinoId: string, logoUrl: string | null | undefined) {
  if (!logoUrl) return null;
  const safe = await assertPublicUrl(logoUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(safe, { signal: controller.signal, cache: "no-store", headers: { "user-agent": "NivaroBot/1.0" } });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.byteLength > 3_500_000) return null;
    const supabase = await createSupabaseServiceClient();
    if (!supabase) return null;
    const ext = extensionFor(contentType, logoUrl);
    const path = `logos/${casinoId}.${ext}`;
    const { error } = await supabase.storage.from("casino-assets").upload(path, bytes, { contentType, upsert: true, cacheControl: "86400" });
    if (error) return null;
    const { data } = supabase.storage.from("casino-assets").getPublicUrl(path);
    return data.publicUrl || null;
  } catch { return null; }
  finally { clearTimeout(timer); }
}
