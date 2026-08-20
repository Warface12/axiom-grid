import Link from "next/link";

import {
  AdminHeader,
  AdminTable,
} from "@/components/admin/AdminShell";

import { CasinoForm } from "@/components/admin/CasinoForm";
import { deleteCasino, getAdminCasinos } from "@/lib/actions/admin";
import { formatRating } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    edit?: string;
    new?: string;
    q?: string;
    status?: string;
    monitoring?: string;
    page?: string;
  }>;
};

type AdminCasino = {
  id: string;
  name: string;
  slug: string;
  rating: number | null;
  active: boolean;
  visible?: boolean | null;
  featured?: boolean | null;

  logo_url?: string | null;

  monitoring_mode?: string | null;
  monitoring_enabled?: boolean | null;
  monitoring_status?: string | null;

  last_checked_at?: string | null;

  no_deposit?: boolean | null;
  free_spins?: boolean | null;

  welcome_bonus?: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getMonitoringLabel(casino: AdminCasino) {
  if (casino.monitoring_enabled === false) {
    return "Off";
  }

  if (casino.monitoring_mode === "manual") {
    return "Manual";
  }

  if (casino.monitoring_mode === "paused") {
    return "Paused";
  }

  if (casino.monitoring_status === "needs_review") {
    return "Needs Review";
  }

  if (casino.monitoring_status === "inaccessible") {
    return "Access Issue";
  }

  if (casino.monitoring_status === "error") {
    return "Error";
  }

  if (casino.monitoring_status === "healthy") {
    return "Healthy";
  }

  return "Automatic";
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export default async function AdminCasinosPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const casinos = (await getAdminCasinos()) as AdminCasino[];

  const editing = params.edit
    ? casinos.find((casino) => casino.id === params.edit)
    : null;

  const editingForForm = editing
    ? {
        ...editing,
        no_deposit: editing.no_deposit ?? undefined,
        free_spins: editing.free_spins ?? undefined,
        featured: editing.featured ?? undefined,
        visible: editing.visible ?? undefined,
        monitoring_enabled:
          editing.monitoring_enabled ?? undefined,
      }
    : undefined;

  const showForm = params.new === "1" || Boolean(editing);

  const query = normalizeText(params.q);
  const status = normalizeText(params.status);
  const monitoring = normalizeText(params.monitoring);

  const filteredCasinos = casinos.filter((casino) => {
    const matchesQuery =
      !query ||
      normalizeText(casino.name).includes(query) ||
      normalizeText(casino.slug).includes(query);

    const monitoringLabel = normalizeText(
      getMonitoringLabel(casino)
    );

    const matchesStatus =
      !status ||
      status === "all" ||
      (status === "active" && casino.active) ||
      (status === "inactive" && !casino.active) ||
      (status === "featured" && casino.featured);

    const matchesMonitoring =
      !monitoring ||
      monitoring === "all" ||
      monitoringLabel === monitoring;

    return (
      matchesQuery &&
      matchesStatus &&
      matchesMonitoring
    );
  });

  const pageSize = 50;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const filteredPages = Math.max(1, Math.ceil(filteredCasinos.length / pageSize));
  const visibleCasinos = filteredCasinos.slice((page - 1) * pageSize, page * pageSize);

  const total = casinos.length;

  const activeCount = casinos.filter(
    (casino) => casino.active
  ).length;


  const needsReviewCount = casinos.filter(
    (casino) =>
      casino.monitoring_status === "needs_review" ||
      casino.monitoring_status === "inaccessible" ||
      casino.monitoring_status === "error"
  ).length;

  const automaticMonitoringCount = casinos.filter(
    (casino) =>
      casino.monitoring_enabled !== false &&
      casino.monitoring_mode !== "manual" &&
      casino.monitoring_mode !== "paused"
  ).length;

  return (
    <main className="admin-page-inner">
      <AdminHeader
        title="Casinos"
        subtitle="Simple manual casino management. Add the essentials first; optional details only when you need them."
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div className="admin-stat-card">
          <span>Total Casinos</span>
          <strong>{total}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Automatic Monitoring</span>
          <strong>{automaticMonitoringCount}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Needs Review</span>
          <strong>{needsReviewCount}</strong>
        </div>
      </section>

      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Link
            href="/admin/casinos?new=1"
            className="primary-btn"
          >
            + New Casino
          </Link>

          <Link href="/admin/bonuses" className="secondary-btn">Bonuses</Link>

          <Link
            href="/admin/markets"
            className="secondary-btn"
          >
            Market Compliance
          </Link>
        </div>
      </section>

      <form
        method="get"
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(220px, 2fr) minmax(150px, 1fr) minmax(150px, 1fr) auto",
          gap: "10px",
          marginBottom: "22px",
        }}
      >
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search casino..."
          className="admin-input"
        />

        <select
          name="status"
          defaultValue={params.status ?? "all"}
          className="admin-input"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="featured">Featured</option>
        </select>

        <select
          name="monitoring"
          defaultValue={params.monitoring ?? "all"}
          className="admin-input"
        >
          <option value="all">All monitoring</option>
          <option value="automatic">
            Automatic
          </option>
          <option value="healthy">Healthy</option>
          <option value="manual">Manual</option>
          <option value="paused">Paused</option>
          <option value="needs review">
            Needs Review
          </option>
          <option value="access issue">
            Access Issue
          </option>
          <option value="off">Off</option>
        </select>

        <button
          type="submit"
          className="secondary-btn"
        >
          Filter
        </button>
      </form>

      {showForm && (
        <section
          style={{
            marginBottom: "28px",
          }}
        >
          <CasinoForm casino={editingForForm} />
        </section>
      )}

      <AdminTable
        headers={[
          "Casino",
          "Rating",
          "Offers",
          "Status",
          "Monitoring",
          "Last Check",
          "Actions",
        ]}
        rows={visibleCasinos.map((casino) => [
          <div
            key={`${casino.id}-casino`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minWidth: "180px",
            }}
          >
            {casino.logo_url ? (
              <img
                src={casino.logo_url}
                alt={`${casino.name} logo`}
                width={40}
                height={40}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,.05)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,.06)",
                  fontWeight: 800,
                }}
              >
                {casino.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div
                style={{
                  fontWeight: 800,
                }}
              >
                {casino.name}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.6,
                }}
              >
                /{casino.slug}
              </div>
            </div>
          </div>,

          `${formatRating(casino.rating ?? 0)}/10`,

          <div
            key={`${casino.id}-offers`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {casino.no_deposit && (
              <span className="admin-badge">
                No Deposit
              </span>
            )}

            {casino.free_spins && (
              <span className="admin-badge">
                Free Spins
              </span>
            )}

            {!casino.no_deposit &&
              !casino.free_spins &&
              casino.welcome_bonus && (
                <span className="admin-badge">
                  Welcome
                </span>
              )}

            {!casino.no_deposit &&
              !casino.free_spins &&
              !casino.welcome_bonus && (
                <span
                  style={{
                    opacity: 0.55,
                  }}
                >
                  —
                </span>
              )}
          </div>,

          casino.active ? "Active" : "Inactive",


          getMonitoringLabel(casino),

          formatDateTime(casino.last_checked_at),

          <div
            key={`${casino.id}-actions`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <Link
              href={`/admin/casinos?edit=${casino.id}`}
              className="secondary-btn"
            >
              Edit
            </Link>

            <Link
              href={`/casinos/${casino.slug}`}
              target="_blank"
              className="secondary-btn"
            >
              View
            </Link>

            <form action={async () => {
              "use server";
              await deleteCasino(casino.id);
            }}>
              <button
                type="submit"
                className="secondary-btn"
                title={`Delete ${casino.name}`}
                style={{ borderColor: "rgba(239,68,68,.35)", color: "#fca5a5" }}
              >
                Delete
              </button>
            </form>
          </div>,
        ])}
      />

      {filteredPages > 1 ? <nav className="admin-pagination">
        {page > 1 ? <Link className="secondary-btn" href={`/admin/casinos?page=${page - 1}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}${params.status ? `&status=${encodeURIComponent(params.status)}` : ""}${params.monitoring ? `&monitoring=${encodeURIComponent(params.monitoring)}` : ""}`}>Previous</Link> : <span />}
        <span>Page {page} of {filteredPages} · {filteredCasinos.length} results</span>
        {page < filteredPages ? <Link className="secondary-btn" href={`/admin/casinos?page=${page + 1}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}${params.status ? `&status=${encodeURIComponent(params.status)}` : ""}${params.monitoring ? `&monitoring=${encodeURIComponent(params.monitoring)}` : ""}`}>Next</Link> : <span />}
      </nav> : null}

      {filteredCasinos.length === 0 && (
        <div
          style={{
            marginTop: "18px",
            padding: "24px",
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          No casinos match the selected filters.
        </div>
      )}
    </main>
  );
}