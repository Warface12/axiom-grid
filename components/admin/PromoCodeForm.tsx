"use client";

import { useActionState } from "react";
import {
  savePromoCode,
  deletePromoCode,
} from "@/lib/actions/promoCodes";

type CasinoOption = {
  id: string;
  name: string;
};

type BonusOption = {
  id: string;
  casino_id?: string | null;
  title: string;
};

type PromoCode = {
  id?: string;
  casino_id?: string | null;
  bonus_id?: string | null;
  slug?: string | null;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  promo_type?: string | null;
  bonus_text?: string | null;
  free_spins_count?: number | null;
  no_deposit?: boolean | null;
  min_deposit?: string | null;
  wagering_requirement?: string | null;
  max_cashout?: string | null;
  game_restrictions?: string | null;
  eligible_countries?: string[];
  new_players_only?: boolean | null;
  terms?: string | null;
  terms_url?: string | null;
  affiliate_tracking_url?: string | null;
  source_url?: string | null;
  expires_at?: string | null;
  verified_at?: string | null;
  last_checked_at?: string | null;
  status?: string | null;
  featured?: boolean | null;
  exclusive_offer?: boolean | null;
  active?: boolean | null;
  sort_order?: number | null;
};

function dateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

const fieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "6px",
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: ".06em",
  textTransform: "uppercase" as const,
  color: "#94a3b8",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 13px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,.1)",
  background: "#111827",
  color: "#fff",
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "105px",
  resize: "vertical" as const,
};

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </span>

      <input
        style={inputStyle}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        defaultValue={defaultValue ?? ""}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>

      <textarea
        style={textareaStyle}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  name,
  defaultChecked = false,
}: {
  label: string;
  description?: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "12px 0",
        borderBottom:
          "1px solid rgba(255,255,255,.06)",
        cursor: "pointer",
      }}
    >
      <span>
        <strong
          style={{
            display: "block",
            color: "#fff",
          }}
        >
          {label}
        </strong>

        {description && (
          <small
            style={{
              display: "block",
              marginTop: "4px",
              color: "#64748b",
            }}
          >
            {description}
          </small>
        )}
      </span>

      <span>
        <input
          type="hidden"
          name={name}
          value="false"
        />

        <input
          type="checkbox"
          name={name}
          value="true"
          defaultChecked={defaultChecked}
          style={{
            width: "19px",
            height: "19px",
          }}
        />
      </span>
    </label>
  );
}

export function PromoCodeForm({
  promo,
  casinos,
  bonuses = [],
}: {
  promo?: PromoCode | null;
  casinos: CasinoOption[];
  bonuses?: BonusOption[];
}) {
  const [state, action, pending] =
    useActionState(
      async (_: unknown, formData: FormData) =>
        savePromoCode(formData),
      null
    );

  return (
    <form
      action={action}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "22px",
        border:
          "1px solid rgba(255,255,255,.08)",
        borderRadius: "18px",
        background: "rgba(255,255,255,.025)",
      }}
    >
      {promo?.id && (
        <input
          type="hidden"
          name="id"
          value={promo.id}
        />
      )}

      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: ".12em",
            color: "#a78bfa",
          }}
        >
          NIVARO PROMO MANAGER
        </div>

        <h2
          style={{
            color: "#fff",
            margin: "6px 0 0",
          }}
        >
          {promo?.id
            ? "Edit Promo Code"
            : "Add Promo Code"}
        </h2>
      </div>

      {state && "error" in state && (
        <div className="notice danger">
          {state.error}
        </div>
      )}

      {state && "success" in state && (
        <div className="notice success">
          Promo code saved successfully.
        </div>
      )}

      <section>
        <h3>Basic Information</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(230px,1fr))",
            gap: "15px",
          }}
        >
          <label style={fieldStyle}>
            <span style={labelStyle}>
              Casino *
            </span>

            <select
              style={inputStyle}
              name="casino_id"
              required
              defaultValue={
                promo?.casino_id ?? ""
              }
            >
              <option value="">
                Select casino
              </option>

              {casinos.map((casino) => (
                <option
                  key={casino.id}
                  value={casino.id}
                >
                  {casino.name}
                </option>
              ))}
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>
              Related Bonus
            </span>

            <select
              style={inputStyle}
              name="bonus_id"
              defaultValue={
                promo?.bonus_id ?? ""
              }
            >
              <option value="">
                No linked bonus
              </option>

              {bonuses.map((bonus) => (
                <option
                  key={bonus.id}
                  value={bonus.id}
                >
                  {bonus.title}
                </option>
              ))}
            </select>
          </label>

          <Field
            label="Title"
            name="title"
            required
            defaultValue={promo?.title}
            placeholder="Exclusive Welcome Promo"
          />

          <Field
            label="Promo Code"
            name="code"
            defaultValue={promo?.code}
            placeholder="NIVARO100"
          />

          <Field
            label="Slug"
            name="slug"
            defaultValue={promo?.slug}
            placeholder="exclusive-welcome-promo"
          />

          <label style={fieldStyle}>
            <span style={labelStyle}>
              Promo Type
            </span>

            <select
              style={inputStyle}
              name="promo_type"
              defaultValue={
                promo?.promo_type ?? "welcome"
              }
            >
              <option value="welcome">
                Welcome
              </option>
              <option value="no_deposit">
                No Deposit
              </option>
              <option value="free_spins">
                Free Spins
              </option>
              <option value="deposit">
                Deposit
              </option>
              <option value="cashback">
                Cashback
              </option>
              <option value="reload">
                Reload
              </option>
              <option value="vip">
                VIP
              </option>
              <option value="exclusive">
                Exclusive
              </option>
              <option value="other">
                Other
              </option>
            </select>
          </label>
        </div>
      </section>

      <section>
        <h3>Offer Details</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(230px,1fr))",
            gap: "15px",
          }}
        >
          <Field
            label="Bonus / Offer Text"
            name="bonus_text"
            defaultValue={promo?.bonus_text}
            placeholder="100% up to $500 + 100 Free Spins"
          />

          <Field
            label="Free Spins Count"
            name="free_spins_count"
            type="number"
            min="0"
            defaultValue={
              promo?.free_spins_count
            }
          />

          <Field
            label="Minimum Deposit"
            name="min_deposit"
            defaultValue={promo?.min_deposit}
          />

          <Field
            label="Wagering Requirement"
            name="wagering_requirement"
            defaultValue={
              promo?.wagering_requirement
            }
            placeholder="35x"
          />

          <Field
            label="Maximum Cashout"
            name="max_cashout"
            defaultValue={promo?.max_cashout}
          />
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            border:
              "1px solid rgba(255,255,255,.08)",
            borderRadius: "14px",
          }}
        >
          <Toggle
            label="No Deposit"
            description="No deposit is required to use this promo."
            name="no_deposit"
            defaultChecked={
              promo?.no_deposit ?? false
            }
          />

          <Toggle
            label="New Players Only"
            name="new_players_only"
            defaultChecked={
              promo?.new_players_only ??
              false
            }
          />

          <Toggle
            label="Featured"
            description="Highlight this promo in important areas."
            name="featured"
            defaultChecked={
              promo?.featured ?? false
            }
          />

          <Toggle
            label="Exclusive Offer"
            description="Mark as a Nivaro exclusive offer."
            name="exclusive_offer"
            defaultChecked={
              promo?.exclusive_offer ??
              false
            }
          />

          <Toggle
            label="Active"
            name="active"
            defaultChecked={
              promo?.active ?? true
            }
          />
        </div>
      </section>

      <section>
        <h3>Description & Restrictions</h3>

        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          <TextArea
            label="Description"
            name="description"
            defaultValue={promo?.description}
          />

          <TextArea
            label="Eligible Countries"
            name="eligible_countries"
            defaultValue={
              promo?.eligible_countries?.join(
                ", "
              ) ?? ""
            }
            placeholder="GB, CA, DE..."
          />

          <TextArea
            label="Game Restrictions"
            name="game_restrictions"
            defaultValue={
              promo?.game_restrictions
            }
          />

          <TextArea
            label="Terms & Conditions"
            name="terms"
            defaultValue={promo?.terms}
          />
        </div>
      </section>

      <section>
        <h3>Links & Source</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "15px",
          }}
        >
          <Field
            label="Affiliate Tracking URL"
            name="affiliate_tracking_url"
            type="url"
            defaultValue={
              promo?.affiliate_tracking_url
            }
          />

          <Field
            label="Terms URL"
            name="terms_url"
            type="url"
            defaultValue={promo?.terms_url}
          />

          <Field
            label="Official Source URL"
            name="source_url"
            type="url"
            defaultValue={promo?.source_url}
          />
        </div>
      </section>

      <section>
        <h3>Status & Monitoring</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "15px",
          }}
        >
          <label style={fieldStyle}>
            <span style={labelStyle}>
              Status
            </span>

            <select
              style={inputStyle}
              name="status"
              defaultValue={
                promo?.status ?? "active"
              }
            >
              <option value="active">
                Active
              </option>
              <option value="scheduled">
                Scheduled
              </option>
              <option value="expired">
                Expired
              </option>
              <option value="paused">
                Paused
              </option>
              <option value="needs_review">
                Needs Review
              </option>
            </select>
          </label>

          <Field
            label="Expires At"
            name="expires_at"
            type="datetime-local"
            defaultValue={dateTimeLocal(
              promo?.expires_at
            )}
          />

          <Field
            label="Verified At"
            name="verified_at"
            type="datetime-local"
            defaultValue={dateTimeLocal(
              promo?.verified_at
            )}
          />

          <Field
            label="Last Checked"
            name="last_checked_at"
            type="datetime-local"
            defaultValue={dateTimeLocal(
              promo?.last_checked_at
            )}
          />

          <Field
            label="Sort Order"
            name="sort_order"
            type="number"
            defaultValue={
              promo?.sort_order ?? 0
            }
          />
        </div>
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          paddingTop: "20px",
          borderTop:
            "1px solid rgba(255,255,255,.08)",
        }}
      >
        <a
          href="/admin/promo-codes"
          className="secondary-btn"
        >
          Cancel
        </a>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {promo?.id && (
            <button
              type="button"
              className="ghost-btn"
              onClick={async () => {
                const confirmed =
                  window.confirm(
                    "Delete this promo code?"
                  );

                if (!confirmed) return;

                await deletePromoCode(
                  promo.id!
                );

                window.location.href =
                  "/admin/promo-codes";
              }}
            >
              Delete
            </button>
          )}

          <button
            type="submit"
            className="primary-btn"
            disabled={pending}
          >
            {pending
              ? "Saving..."
              : "Save Promo Code"}
          </button>
        </div>
      </div>
    </form>
  );
}