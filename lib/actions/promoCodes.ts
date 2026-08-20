"use server";

import { revalidatePath } from "next/cache";

import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";

import { requireAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

async function getAdminServiceClient() {
  await requireAdmin();

  const supabase =
    await createSupabaseServiceClient();

  if (!supabase) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing."
    );
  }

  return supabase;
}

function text(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const result = value.trim();

  return result || null;
}

function bool(
  value: FormDataEntryValue | null
) {
  return value === "true" || value === "on";
}

function numberValue(
  value: FormDataEntryValue | null
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function list(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dateValue(
  value: FormDataEntryValue | null
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

async function logAudit(
  action: string,
  entityId: string | null
) {
  try {
    const sessionClient =
      await createSupabaseServerClient();

    const {
      data: { user },
    } =
      await sessionClient.auth.getUser();

    const serviceClient =
      await createSupabaseServiceClient();

    if (!serviceClient) return;

    await serviceClient
      .from("audit_log")
      .insert({
        actor_user_id:
          user?.id ?? null,
        action,
        entity_type: "promo_code",
        entity_id: entityId,
      });
  } catch (error) {
    console.error(
      "Promo code audit error:",
      error
    );
  }
}

export async function savePromoCode(
  formData: FormData
) {
  try {
    const supabase =
      await getAdminServiceClient();

    const id = text(
      formData.get("id")
    );

    const casinoId = text(
      formData.get("casino_id")
    );

    const title = text(
      formData.get("title")
    );

    let slug = text(
      formData.get("slug")
    );

    if (!casinoId) {
      return {
        error:
          "Casino is required.",
      };
    }

    if (!title) {
      return {
        error:
          "Promo title is required.",
      };
    }

    if (!slug) {
      slug = slugify(title);
    }

    const payload = {
      casino_id: casinoId,

      bonus_id: text(
        formData.get("bonus_id")
      ),

      slug,

      code: text(
        formData.get("code")
      ),

      title,

      description: text(
        formData.get(
          "description"
        )
      ),

      promo_type: text(
        formData.get(
          "promo_type"
        )
      ),

      bonus_text: text(
        formData.get(
          "bonus_text"
        )
      ),

      free_spins_count:
        numberValue(
          formData.get(
            "free_spins_count"
          )
        ),

      no_deposit: bool(
        formData.get(
          "no_deposit"
        )
      ),

      min_deposit: text(
        formData.get(
          "min_deposit"
        )
      ),

      wagering_requirement:
        text(
          formData.get(
            "wagering_requirement"
          )
        ),

      max_cashout: text(
        formData.get(
          "max_cashout"
        )
      ),

      game_restrictions:
        text(
          formData.get(
            "game_restrictions"
          )
        ),

      eligible_countries:
        list(
          formData.get(
            "eligible_countries"
          )
        ),

      new_players_only:
        bool(
          formData.get(
            "new_players_only"
          )
        ),

      terms: text(
        formData.get("terms")
      ),

      terms_url: text(
        formData.get(
          "terms_url"
        )
      ),

      affiliate_tracking_url:
        text(
          formData.get(
            "affiliate_tracking_url"
          )
        ),

      source_url: text(
        formData.get(
          "source_url"
        )
      ),

      expires_at: dateValue(
        formData.get(
          "expires_at"
        )
      ),

      verified_at: dateValue(
        formData.get(
          "verified_at"
        )
      ),

      last_checked_at:
        dateValue(
          formData.get(
            "last_checked_at"
          )
        ),

      status:
        text(
          formData.get(
            "status"
          )
        ) ?? "active",

      featured: bool(
        formData.get(
          "featured"
        )
      ),

      exclusive_offer: bool(
        formData.get(
          "exclusive_offer"
        )
      ),

      active:
        bool(
          formData.get("active")
        ),

      sort_order:
        numberValue(
          formData.get(
            "sort_order"
          )
        ) ?? 0,

      updated_at:
        new Date().toISOString(),
    };

    if (id) {
      const { error } =
        await supabase
          .from("promo_code")
          .update(payload)
          .eq("id", id);

      if (error) {
        return {
          error: error.message,
        };
      }

      await logAudit(
        "update",
        id
      );
    } else {
      const {
        data,
        error,
      } =
        await supabase
          .from("promo_code")
          .insert(payload)
          .select("id")
          .single();

      if (error) {
        return {
          error: error.message,
        };
      }

      await logAudit(
        "create",
        data.id
      );
    }

    revalidatePath("/");
    revalidatePath(
      "/promo-codes"
    );
    revalidatePath(
      "/admin/promo-codes"
    );
    revalidatePath(
      "/admin/casinos"
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to save promo code.",
    };
  }
}

export async function deletePromoCode(
  id: string
) {
  try {
    const supabase =
      await getAdminServiceClient();

    if (!id) {
      return {
        error:
          "Promo code ID is required.",
      };
    }

    const { error } =
      await supabase
        .from("promo_code")
        .delete()
        .eq("id", id);

    if (error) {
      return {
        error: error.message,
      };
    }

    await logAudit(
      "delete",
      id
    );

    revalidatePath(
      "/promo-codes"
    );
    revalidatePath(
      "/admin/promo-codes"
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete promo code.",
    };
  }
}

export async function getAdminPromoCodes() {
  const supabase =
    await getAdminServiceClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("promo_code")
      .select(
        `
          *,
          casino:casino_id (
            id,
            name,
            slug
          )
        `
      )
      .order(
        "updated_at",
        {
          ascending: false,
        }
      );

  if (error) {
    console.error(
      "getAdminPromoCodes:",
      error.message
    );

    return [];
  }

  return data ?? [];
}