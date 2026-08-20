export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

/* =========================================================
   HELPERS
========================================================= */

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed || null;
}

function requiredText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function bool(
  value: unknown,
  defaultValue = false
): boolean {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    return [
      "true",
      "1",
      "yes",
      "on",
      "enabled",
    ].includes(normalized);
  }

  return false;
}

function nullableBool(
  value: unknown
): boolean | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return bool(value);
}

function numberValue(
  value: unknown,
  defaultValue = 0
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : defaultValue;
}

function nullableNumber(
  value: unknown
): number | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function integerValue(
  value: unknown,
  defaultValue = 0
): number {
  const parsed = Number.parseInt(
    String(value ?? ""),
    10
  );

  return Number.isFinite(parsed)
    ? parsed
    : defaultValue;
}

function nullableInteger(
  value: unknown
): number | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number.parseInt(
    String(value),
    10
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item).trim()
      )
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function jsonObject(
  value: unknown
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    try {
      const parsed = JSON.parse(value);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      return {};
    }
  }

  return {};
}

function optionalDate(
  value: unknown
): string | null {
  const raw = text(value);

  if (!raw) return null;

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function valueFromOptions(
  value: unknown,
  options: readonly string[],
  fallback: string
): string {
  const normalized =
    typeof value === "string"
      ? value.trim()
      : "";

  return options.includes(normalized)
    ? normalized
    : fallback;
}

/* =========================================================
   CASINO VALIDATION
========================================================= */

export function validateCasinoInput(
  raw: any
): ValidationResult<any> {
  const errors: string[] = [];

  const name = requiredText(raw.name);
  const slug = requiredText(raw.slug);

  const rating = numberValue(
    raw.rating,
    0
  );

  if (!name) {
    errors.push("Name is required");
  }

  if (!slug) {
    errors.push("Slug is required");
  }

  if (rating < 0 || rating > 10) {
    errors.push(
      "Rating must be between 0 and 10"
    );
  }

  if (errors.length) {
    return {
      success: false,
      errors,
    };
  }

  const verificationStatus =
    valueFromOptions(
      raw.verification_status,
      [
        "pending",
        "verified",
        "unverified",
        "needs_review",
      ],
      raw.verified_at
        ? "verified"
        : "pending"
    );

  const monitoringMode =
    valueFromOptions(
      raw.monitoring_mode,
      [
        "automatic",
        "manual",
        "paused",
      ],
      "automatic"
    );

  const monitoringStatus =
    valueFromOptions(
      raw.monitoring_status,
      [
        "pending",
        "healthy",
        "checking",
        "changed",
        "needs_review",
        "inaccessible",
        "paused",
        "manual",
        "error",
      ],
      monitoringMode === "manual"
        ? "manual"
        : monitoringMode === "paused"
          ? "paused"
          : "pending"
    );

  const aiImportStatus =
    valueFromOptions(
      raw.ai_import_status,
      [
        "not_started",
        "queued",
        "running",
        "completed",
        "partial",
        "failed",
        "needs_review",
      ],
      "not_started"
    );

  return {
    success: true,

    data: {
      name,
      slug,

      official_url: text(
        raw.official_url
      ),

      logo_url: text(raw.logo_url),

      cover_image_url: text(
        raw.cover_image_url
      ),

      description: text(
        raw.description
      ),

      review_content: text(
        raw.review_content
      ),

      final_verdict: text(
        raw.final_verdict
      ),

      rating,

      rating_breakdown: jsonObject(
        raw.rating_breakdown
      ),

      welcome_bonus: text(
        raw.welcome_bonus
      ),

      no_deposit: bool(
        raw.no_deposit
      ),

      no_deposit_bonus: text(
        raw.no_deposit_bonus
      ),

      free_spins: bool(
        raw.free_spins
      ),

      free_spins_count:
        nullableInteger(
          raw.free_spins_count
        ),

      free_spins_details: text(
        raw.free_spins_details
      ),

      cashback: text(raw.cashback),

      crypto: bool(raw.crypto),

      payment_methods: list(
        raw.payment_methods
      ),

      providers: list(raw.providers),

      games: list(raw.games),

      license_info: text(
        raw.license_info
      ),

      license_authority: text(
        raw.license_authority
      ),

      license_number: text(
        raw.license_number
      ),

      owner_name: text(
        raw.owner_name
      ),

      founded_year:
        nullableInteger(
          raw.founded_year
        ),

      country_codes: list(
        raw.country_codes
      ),

      region_codes: list(
        raw.region_codes
      ).map((value) => value.toLowerCase()),

      us_states: list(
        raw.us_states
      ),

      currencies: list(
        raw.currencies
      ),

      languages: list(
        raw.languages
      ),

      min_deposit: text(
        raw.min_deposit
      ),

      withdrawal_info: text(
        raw.withdrawal_info
      ),

      withdrawal_limits: text(
        raw.withdrawal_limits
      ),

      payout_speed: text(
        raw.payout_speed
      ),

      kyc_required: nullableBool(
        raw.kyc_required
      ),

      mobile_app: nullableBool(
        raw.mobile_app
      ),

      live_chat: nullableBool(
        raw.live_chat
      ),

      vip_program: nullableBool(
        raw.vip_program
      ),

      support_email: text(
        raw.support_email
      ),

      support_url: text(
        raw.support_url
      ),

      pros: list(raw.pros),

      cons: list(raw.cons),

      affiliate_url: text(
        raw.affiliate_url
      ),

      affiliate_partner_id: text(
        raw.affiliate_partner_id
      ),

      affiliate_partner_external_id:
        text(
          raw.affiliate_partner_external_id
        ),

      seo_title: text(
        raw.seo_title
      ),

      seo_description: text(
        raw.seo_description
      ),

      verification_status:
        verificationStatus,

      verified_at:
        verificationStatus ===
        "verified"
          ? optionalDate(
              raw.verified_at
            ) ??
            new Date().toISOString()
          : optionalDate(
              raw.verified_at
            ),

      featured: bool(raw.featured),

      active:
        raw.active === undefined
          ? true
          : bool(raw.active),

      visible:
        raw.visible === undefined
          ? true
          : bool(raw.visible),

      sort_order: integerValue(
        raw.sort_order,
        0
      ),

      ai_import_enabled:
        raw.ai_import_enabled ===
        undefined
          ? true
          : bool(
              raw.ai_import_enabled
            ),

      ai_import_status:
        aiImportStatus,

      ai_import_confidence:
        nullableNumber(
          raw.ai_import_confidence
        ),

      ai_imported_at:
        optionalDate(
          raw.ai_imported_at
        ),

      ai_import_notes:
        jsonObject(
          raw.ai_import_notes
        ),

      monitoring_mode:
        monitoringMode,

      monitoring_enabled:
        raw.monitoring_enabled ===
        undefined
          ? true
          : bool(
              raw.monitoring_enabled
            ),

      auto_update_enabled:
        raw.auto_update_enabled ===
        undefined
          ? true
          : bool(
              raw.auto_update_enabled
            ),

      monitoring_alerts_enabled:
        raw.monitoring_alerts_enabled ===
        undefined
          ? true
          : bool(
              raw.monitoring_alerts_enabled
            ),

      monitoring_status:
        monitoringStatus,

      last_checked_at:
        optionalDate(
          raw.last_checked_at
        ),

      last_successful_check_at:
        optionalDate(
          raw.last_successful_check_at
        ),

      next_check_at:
        optionalDate(
          raw.next_check_at
        ),

      last_monitoring_error:
        text(
          raw.last_monitoring_error
        ),
    },
  };
}

/* =========================================================
   BONUS VALIDATION
========================================================= */

export function validateBonusInput(
  raw: any
): ValidationResult<any> {
  const errors: string[] = [];

  const casinoId = requiredText(
    raw.casino_id
  );

  const title = requiredText(
    raw.title
  );

  const slug = requiredText(raw.slug);

  const type =
    requiredText(raw.type) ||
    "welcome";

  if (!casinoId) {
    errors.push(
      "Casino is required"
    );
  }

  if (!title) {
    errors.push(
      "Bonus title is required"
    );
  }

  if (!slug) {
    errors.push(
      "Bonus slug is required"
    );
  }

  if (errors.length) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,

    data: {
      casino_id: casinoId,

      slug,

      type,

      title,

      amount: text(raw.amount),

      bonus_percentage:
        nullableNumber(
          raw.bonus_percentage
        ),

      free_spins: text(
        raw.free_spins
      ),

      free_spins_count:
        nullableInteger(
          raw.free_spins_count
        ),

      free_spins_value: text(
        raw.free_spins_value
      ),

      no_deposit: bool(
        raw.no_deposit
      ),

      deposit_required:
        nullableBool(
          raw.deposit_required
        ),

      wagering_requirement:
        text(
          raw.wagering_requirement
        ),

      promo_code: text(
        raw.promo_code
      ),

      min_deposit: text(
        raw.min_deposit
      ),

      max_bonus: text(
        raw.max_bonus
      ),

      max_cashout: text(
        raw.max_cashout
      ),

      game_restrictions: text(
        raw.game_restrictions
      ),

      eligible_countries: list(
        raw.eligible_countries
      ),

      eligible_states: list(
        raw.eligible_states
      ),

      new_players_only:
        nullableBool(
          raw.new_players_only
        ),

      terms: text(raw.terms),

      terms_url: text(
        raw.terms_url
      ),

      affiliate_tracking_url:
        text(
          raw.affiliate_tracking_url
        ),

      expires_at:
        optionalDate(
          raw.expires_at
        ),

      status: valueFromOptions(
        raw.status,
        [
          "active",
          "expired",
          "scheduled",
          "paused",
          "needs_review",
        ],
        "active"
      ),

      featured: bool(
        raw.featured
      ),

      exclusive_offer: bool(
        raw.exclusive_offer
      ),

      seo_title: text(
        raw.seo_title
      ),

      seo_description: text(
        raw.seo_description
      ),

      verified_at:
        optionalDate(
          raw.verified_at
        ),

      source: text(raw.source),

      source_url: text(
        raw.source_url
      ),

      last_checked_at:
        optionalDate(
          raw.last_checked_at
        ),

      sort_order:
        integerValue(
          raw.sort_order,
          0
        ),

      active:
        raw.active === undefined
          ? true
          : bool(raw.active),
    },
  };
}

/* =========================================================
   GUIDE VALIDATION
========================================================= */

export function validateGuideInput(
  raw: any
): ValidationResult<any> {
  const errors: string[] = [];

  const title =
    requiredText(raw.title);

  const slug =
    requiredText(raw.slug);

  if (!title) {
    errors.push(
      "Guide title is required"
    );
  }

  if (!slug) {
    errors.push(
      "Guide slug is required"
    );
  }

  if (errors.length) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,

    data: {
      slug,

      title,

      excerpt: text(
        raw.excerpt
      ),

      content:
        typeof raw.content ===
        "string"
          ? raw.content
          : "",

      featured_image_url:
        text(
          raw.featured_image_url
        ),

      categories: list(
        raw.categories
      ),

      tags: list(raw.tags),

      seo_title: text(
        raw.seo_title
      ),

      seo_description: text(
        raw.seo_description
      ),

      published: bool(
        raw.published
      ),

      published_at:
        optionalDate(
          raw.published_at
        ),
    },
  };
}

/* =========================================================
   AFFILIATE PARTNER VALIDATION
========================================================= */

export function validatePartnerInput(
  raw: any
): ValidationResult<any> {
  const errors: string[] = [];

  const name =
    requiredText(raw.name);

  const slug =
    requiredText(raw.slug);

  if (!name) {
    errors.push(
      "Partner name is required"
    );
  }

  if (!slug) {
    errors.push(
      "Partner slug is required"
    );
  }

  if (errors.length) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,

    data: {
      name,

      slug,

      network: text(
        raw.network
      ),

      contact_email: text(
        raw.contact_email
      ),

      contact_name: text(
        raw.contact_name
      ),

      contact_telegram: text(
        raw.contact_telegram
      ),

      dashboard_url: text(
        raw.dashboard_url
      ),

      api_base_url: text(
        raw.api_base_url
      ),

      api_key_secret_name:
        text(
          raw.api_key_secret_name
        ),

      preferred_model:
        valueFromOptions(
          raw.preferred_model,
          [
            "revshare",
            "cpa",
            "hybrid",
            "other",
          ],
          "revshare"
        ),

      status:
        valueFromOptions(
          raw.status,
          [
            "pending",
            "active",
            "paused",
            "inactive",
            "rejected",
          ],
          "pending"
        ),

      notes: text(raw.notes),
    },
  };
}

/* =========================================================
   SEO VALIDATION
========================================================= */

export function validateSeoInput(
  raw: any
): ValidationResult<any> {
  const errors: string[] = [];

  const pageKey =
    requiredText(raw.page_key);

  if (!pageKey) {
    errors.push(
      "SEO page key is required"
    );
  }

  if (errors.length) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,

    data: {
      page_key: pageKey,

      title: text(raw.title),

      description: text(
        raw.description
      ),

      canonical_path: text(
        raw.canonical_path
      ),

      og_image_url: text(
        raw.og_image_url
      ),

      no_index: bool(
        raw.no_index
      ),

      structured_data:
        jsonObject(
          raw.structured_data
        ),
    },
  };
}