import Link from "next/link";

import {
  AdminHeader,
  AdminTable,
} from "@/components/admin/AdminShell";

import {
  getAutomationSettings,
  getMonitoringCasinos,
  getMonitoringAlerts,
  saveAutomationSettings,
  saveCasinoMonitoring,
  resolveMonitoringAlert,
  runCasinoMonitoringCheck,
  runAllMonitoringChecks,
} from "@/lib/actions/monitoring";

export const dynamic = "force-dynamic";

type MonitoringCasino = {
  id: string;
  name: string;
  slug: string;
  active?: boolean | null;

  monitoring_mode?: string | null;
  monitoring_enabled?: boolean | null;
  auto_update_enabled?: boolean | null;
  monitoring_alerts_enabled?: boolean | null;

  monitoring_status?: string | null;

  last_checked_at?: string | null;
  last_successful_check_at?: string | null;
  next_check_at?: string | null;

  last_monitoring_error?: string | null;
};

type MonitoringAlert = {
  id: string;
  casino_id?: string | null;

  alert_type?: string | null;
  severity?: string | null;
  title?: string | null;
  message?: string | null;

  status?: string | null;

  created_at?: string | null;

  casino?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;
};

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Never";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

function statusLabel(
  value?: string | null
) {
  switch (value) {
    case "healthy":
      return "Healthy";

    case "pending":
      return "Pending";

    case "checking":
      return "Checking";

    case "needs_review":
      return "Needs Review";

    case "access_blocked":
      return "Access Blocked";

    case "manual":
      return "Manual";

    case "paused":
      return "Paused";

    default:
      return (
        value ||
        "Pending"
      );
  }
}

export default async function MonitoringPage() {
  const [
    settingsData,
    casinoData,
    alertData,
  ] = await Promise.all([
    getAutomationSettings(),
    getMonitoringCasinos(),
    getMonitoringAlerts(),
  ]);

  const settings =
    settingsData;

  const casinos =
    casinoData as MonitoringCasino[];

  const alerts =
    alertData as MonitoringAlert[];

  const automaticCount =
    casinos.filter(
      (casino) =>
        casino.monitoring_enabled !== false &&
        casino.monitoring_mode !== "manual" &&
        casino.monitoring_mode !== "paused"
    ).length;

  const manualCount =
    casinos.filter(
      (casino) =>
        casino.monitoring_mode ===
        "manual"
    ).length;

  const pausedCount =
    casinos.filter(
      (casino) =>
        casino.monitoring_mode ===
          "paused" ||
        casino.monitoring_enabled ===
          false
    ).length;

  const needsReviewCount =
    casinos.filter(
      (casino) =>
        casino.monitoring_status ===
          "needs_review" ||
        casino.monitoring_status ===
          "access_blocked"
    ).length;

  return (
    <main className="admin-page-inner">

      <AdminHeader
        title="AI Monitoring"
        subtitle="Control Nivaro's casino monitoring, automatic updates, alerts and manual review workflow."
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(170px,1fr))",
          gap: "14px",
          marginBottom: "26px",
        }}
      >
        <div className="admin-stat-card">
          <span>
            Tracked Casinos
          </span>

          <strong>
            {casinos.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Automatic
          </span>

          <strong>
            {automaticCount}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Manual
          </span>

          <strong>
            {manualCount}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Paused
          </span>

          <strong>
            {pausedCount}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Needs Review
          </span>

          <strong>
            {needsReviewCount}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Open Alerts
          </span>

          <strong>
            {alerts.length}
          </strong>
        </div>
      </section>

      <section
        className="admin-form"
        style={{
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 6px",
              }}
            >
              Monitoring Engine
            </h2>

            <p
              style={{
                margin: 0,
                opacity: 0.65,
                maxWidth:
                  "720px",
              }}
            >
              Run real monitoring checks
              for every eligible casino
              using the configured
              monitoring sources.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await runAllMonitoringChecks();
            }}
          >
            <button
              type="submit"
              className="primary-btn"
            >
              Run All Checks Now
            </button>
          </form>
        </div>

        <div
          className="notice"
          style={{
            marginTop: "16px",
          }}
        >
          Monitoring never invents casino
          or bonus information. If a source
          cannot be verified, Nivaro creates
          a Needs Review alert instead of
          silently overwriting data.
        </div>
      </section>

      <section
        className="admin-form"
        style={{
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 6px",
            }}
          >
            Global Automation Controls
          </h2>

          <p
            style={{
              margin: 0,
              opacity: 0.65,
              maxWidth:
                "760px",
            }}
          >
            These settings control the
            monitoring system across all
            eligible casino partners.
          </p>
        </div>

        <form
          action={async (formData: FormData) => {
            "use server";
            await saveAutomationSettings(formData);
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(210px,1fr))",
              gap: "14px",
            }}
          >
            <label className="admin-field admin-checkbox">
              <input
                type="checkbox"
                name="global_monitoring_enabled"
                defaultChecked={
                  settings?.global_monitoring_enabled ??
                  true
                }
              />

              <span>
                Global Monitoring ON
              </span>
            </label>

            <label className="admin-field admin-checkbox">
              <input
                type="checkbox"
                name="global_auto_update_enabled"
                defaultChecked={
                  settings?.global_auto_update_enabled ??
                  true
                }
              />

              <span>
                Automatic Updates ON
              </span>
            </label>

            <label className="admin-field admin-checkbox">
              <input
                type="checkbox"
                name="global_alerts_enabled"
                defaultChecked={
                  settings?.global_alerts_enabled ??
                  true
                }
              />

              <span>
                Alerts ON
              </span>
            </label>

            <label className="admin-field admin-checkbox">
              <input
                type="checkbox"
                name="ai_import_enabled"
                defaultChecked={
                  settings?.ai_import_enabled ??
                  true
                }
              />

              <span>
                AI Import ON
              </span>
            </label>
          </div>

          <div
            className="admin-form-grid"
            style={{
              marginTop: "18px",
            }}
          >
            <label className="admin-field">
              <span>
                Monitoring Interval
                (hours)
              </span>

              <input
                type="number"
                name="check_interval_hours"
                min="1"
                defaultValue={
                  settings?.check_interval_hours ??
                  24
                }
              />
            </label>

            <label className="admin-field">
              <span>
                Temporary Failure Retry
                Limit
              </span>

              <input
                type="number"
                name="transient_retry_limit"
                min="0"
                defaultValue={
                  settings?.transient_retry_limit ??
                  3
                }
              />
            </label>
          </div>

          <div
            className="notice"
            style={{
              marginTop: "18px",
            }}
          >
            If a casino becomes
            permanently inaccessible, the
            monitoring engine should create
            a review alert instead of
            inventing or replacing data.
          </div>

          <div
            className="admin-form-actions"
            style={{
              marginTop: "18px",
            }}
          >
            <button
              type="submit"
              className="primary-btn"
            >
              Save Global Settings
            </button>
          </div>
        </form>
      </section>

      <section
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        <Link
          href="/admin/casinos"
          className="secondary-btn"
        >
          Manage Casinos
        </Link>

        <Link
          href="/admin/bonuses"
          className="secondary-btn"
        >
          Manage Bonuses
        </Link>

        <Link
          href="/admin/promo-codes"
          className="secondary-btn"
        >
          Promo Codes
        </Link>
      </section>

      <section
        style={{
          marginBottom: "34px",
        }}
      >
        <div
          style={{
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 6px",
            }}
          >
            Casino Monitoring
          </h2>

          <p
            style={{
              margin: 0,
              opacity: 0.65,
            }}
          >
            Configure and run monitoring
            independently for every casino
            partner.
          </p>
        </div>

        {casinos.length === 0 ? (
          <div className="notice">
            No casinos available for
            monitoring.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {casinos.map(
              (casino) => (
                <div
                  key={casino.id}
                  className="admin-form"
                >
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await saveCasinoMonitoring(formData);
                    }}
                  >
                    <input
                      type="hidden"
                      name="casino_id"
                      value={
                        casino.id
                      }
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "18px",
                        flexWrap:
                          "wrap",
                        marginBottom:
                          "18px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin:
                              "0 0 5px",
                          }}
                        >
                          {
                            casino.name
                          }
                        </h3>

                        <div
                          style={{
                            fontSize:
                              "13px",
                            opacity:
                              0.6,
                          }}
                        >
                          /
                          {
                            casino.slug
                          }
                        </div>
                      </div>

                      <strong>
                        {statusLabel(
                          casino.monitoring_status
                        )}
                      </strong>
                    </div>

                    <div className="admin-form-grid">
                      <label className="admin-field">
                        <span>
                          Monitoring Mode
                        </span>

                        <select
                          name="monitoring_mode"
                          defaultValue={
                            casino.monitoring_mode ??
                            "automatic"
                          }
                        >
                          <option value="automatic">
                            Automatic
                          </option>

                          <option value="manual">
                            Manual
                          </option>

                          <option value="paused">
                            Paused
                          </option>
                        </select>
                      </label>

                      <label className="admin-field admin-checkbox">
                        <input
                          type="checkbox"
                          name="monitoring_enabled"
                          defaultChecked={
                            casino.monitoring_enabled ??
                            true
                          }
                        />

                        <span>
                          Monitoring
                          Enabled
                        </span>
                      </label>

                      <label className="admin-field admin-checkbox">
                        <input
                          type="checkbox"
                          name="auto_update_enabled"
                          defaultChecked={
                            casino.auto_update_enabled ??
                            true
                          }
                        />

                        <span>
                          Auto Update
                          Bonuses
                        </span>
                      </label>

                      <label className="admin-field admin-checkbox">
                        <input
                          type="checkbox"
                          name="monitoring_alerts_enabled"
                          defaultChecked={
                            casino.monitoring_alerts_enabled ??
                            true
                          }
                        />

                        <span>
                          Send Alerts
                        </span>
                      </label>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(180px,1fr))",
                        gap: "12px",
                        marginTop:
                          "18px",
                      }}
                    >
                      <div className="admin-stat-card">
                        <span>
                          Last Check
                        </span>

                        <strong
                          style={{
                            fontSize:
                              "14px",
                          }}
                        >
                          {formatDate(
                            casino.last_checked_at
                          )}
                        </strong>
                      </div>

                      <div className="admin-stat-card">
                        <span>
                          Last Successful
                          Check
                        </span>

                        <strong
                          style={{
                            fontSize:
                              "14px",
                          }}
                        >
                          {formatDate(
                            casino.last_successful_check_at
                          )}
                        </strong>
                      </div>

                      <div className="admin-stat-card">
                        <span>
                          Next Check
                        </span>

                        <strong
                          style={{
                            fontSize:
                              "14px",
                          }}
                        >
                          {formatDate(
                            casino.next_check_at
                          )}
                        </strong>
                      </div>
                    </div>

                    {casino.last_monitoring_error && (
                      <div
                        className="notice danger"
                        style={{
                          marginTop:
                            "16px",
                        }}
                      >
                        <strong>
                          Last monitoring
                          problem:
                        </strong>{" "}
                        {
                          casino.last_monitoring_error
                        }
                      </div>
                    )}

                    <div
                      className="admin-form-actions"
                      style={{
                        marginTop:
                          "18px",
                      }}
                    >
                      <button
                        type="submit"
                        className="primary-btn"
                      >
                        Save Monitoring
                        Settings
                      </button>

                      <Link
                        href={`/admin/casinos?edit=${casino.id}`}
                        className="secondary-btn"
                      >
                        Edit Casino
                      </Link>
                    </div>
                  </form>

                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await runCasinoMonitoringCheck(formData);
                    }}
                    style={{
                      marginTop:
                        "12px",
                    }}
                  >
                    <input
                      type="hidden"
                      name="casino_id"
                      value={
                        casino.id
                      }
                    />

                    <button
                      type="submit"
                      className="secondary-btn"
                      disabled={
                        casino.monitoring_enabled ===
                          false ||
                        casino.monitoring_mode ===
                          "paused"
                      }
                    >
                      Run Check Now
                    </button>
                  </form>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section>
        <div
          style={{
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 6px",
            }}
          >
            Needs Review & Alerts
          </h2>

          <p
            style={{
              margin: 0,
              opacity: 0.65,
            }}
          >
            Problems that require manual
            attention appear here.
          </p>
        </div>

        <AdminTable
          headers={[
            "Casino",
            "Problem",
            "Severity",
            "Created",
            "Status",
            "Action",
          ]}
          rows={alerts.map(
            (alert) => [
              alert.casino?.name ??
                "Unknown Casino",

              <div
                key={`${alert.id}-problem`}
                style={{
                  minWidth:
                    "220px",
                }}
              >
                <strong>
                  {alert.title ??
                    alert.alert_type ??
                    "Monitoring Alert"}
                </strong>

                {alert.message && (
                  <div
                    style={{
                      marginTop:
                        "5px",
                      opacity:
                        0.65,
                      fontSize:
                        "12px",
                    }}
                  >
                    {
                      alert.message
                    }
                  </div>
                )}
              </div>,

              alert.severity ??
                "warning",

              formatDate(
                alert.created_at
              ),

              alert.status ??
                "open",

              <form
                key={`${alert.id}-resolve`}
                action={async (formData: FormData) => {
                  "use server";
                  await resolveMonitoringAlert(formData);
                }}
              >
                <input
                  type="hidden"
                  name="alert_id"
                  value={
                    alert.id
                  }
                />

                <button
                  type="submit"
                  className="secondary-btn"
                >
                  Resolve
                </button>
              </form>,
            ]
          )}
        />
      </section>
    </main>
  );
}