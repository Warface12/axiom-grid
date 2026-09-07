import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/supabase/admin";
import { adminDb } from "@/lib/adminDb";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);
const MAX_BYTES = 2_000_000;

export async function POST(request: NextRequest) {
  if (!(await isAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Choose an image file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Images must be 2MB or smaller." }, { status: 400 });
  const ext = ALLOWED.get(file.type);
  if (!ext) return NextResponse.json({ ok: false, error: "Only JPEG, PNG, WebP or SVG files are accepted." }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `platforms/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const upload = await db.storage.from("platform-media").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (upload.error) {
    return NextResponse.json({
      ok: false,
      error: /bucket/i.test(upload.error.message)
        ? "Apply the partner-ready migration so the platform-media storage bucket exists, then retry."
        : upload.error.message,
    }, { status: 500 });
  }
  const publicUrl = db.storage.from("platform-media").getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ ok: true, url: publicUrl, path });
}
