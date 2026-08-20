"use client";

import { useActionState } from "react";
import { saveGuide, deleteGuide } from "@/lib/actions/admin";
import { AdminFormField } from "@/components/admin/AdminShell";
import { joinList } from "@/lib/utils";

type Guide = {
  id?: string; slug?: string; title?: string; excerpt?: string | null; content?: string;
  featured_image_url?: string | null; categories?: string[]; tags?: string[];
  seo_title?: string | null; seo_description?: string | null; published?: boolean;
};

export function GuideForm({ guide }: { guide?: Guide | null }) {
  const [state, action, pending] = useActionState(async (_: unknown, formData: FormData) => saveGuide(formData), null);

  return (
    <form action={action} className="admin-form">
      {guide?.id && <input type="hidden" name="id" value={guide.id} />}
      {state && "error" in state && <div className="notice danger">{state.error}</div>}
      {state && "success" in state && <div className="notice success">Guide saved successfully.</div>}

      <div className="admin-form-grid">
        <AdminFormField label="Title" name="title" defaultValue={guide?.title} required />
        <AdminFormField label="Slug" name="slug" defaultValue={guide?.slug} required />
        <AdminFormField label="Featured Image URL" name="featured_image_url" defaultValue={guide?.featured_image_url || ""} />
        <AdminFormField label="Categories (comma-separated)" name="categories" defaultValue={joinList(guide?.categories)} />
        <AdminFormField label="Tags (comma-separated)" name="tags" defaultValue={joinList(guide?.tags)} />
        <AdminFormField label="SEO Title" name="seo_title" defaultValue={guide?.seo_title || ""} />
        <AdminFormField label="SEO Description" name="seo_description" defaultValue={guide?.seo_description || ""} as="textarea" rows={2} />
      </div>
      <AdminFormField label="Excerpt" name="excerpt" defaultValue={guide?.excerpt || ""} as="textarea" rows={2} />
      <AdminFormField label="Content" name="content" defaultValue={guide?.content || ""} as="textarea" rows={12} />
      <AdminFormField label="Published" name="published" as="checkbox" defaultValue={guide?.published} />
      <div className="admin-form-actions">
        <button type="submit" className="primary-btn" disabled={pending}>{pending ? "Saving..." : "Save Guide"}</button>
        {guide?.id && (
          <button type="button" className="ghost-btn" onClick={async () => { await deleteGuide(guide.id!); window.location.href = "/admin/guides"; }}>Delete</button>
        )}
      </div>
    </form>
  );
}
