"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Gift,
  BarChart3,
  Database,
  LogOut,
  Menu,
  Shield,
  Globe2,
  SearchCheck,
  X,
} from "lucide-react";

import { adminSignOut } from "@/lib/actions/admin";


const NAV = [
  {
    href: "/admin",
    label: "Overview",
    icon: BarChart3,
  },
  {
    href: "/admin/casinos",
    label: "Casinos",
    icon: Database,
  },
  {
    href: "/admin/bonuses",
    label: "Bonuses",
    icon: Gift,
  },
  {
    href: "/admin/markets",
    label: "Market Compliance",
    icon: Globe2,
  },
  {
    href: "/admin/seo",
    label: "SEO & Search",
    icon: SearchCheck,
  },
];


export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);


  async function handleSignOut() {
    await adminSignOut();

    window.location.href =
      "/admin/login";
  }


  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }


  return (
    <div className="admin-shell">

      {/* =========================================
          SIDEBAR
      ========================================== */}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >
        <div className="admin-sidebar-top">

          <Link href="/admin" className="admin-brand-link" onClick={closeMobileMenu}>
            <span className="admin-brand-mark" aria-hidden="true"><img src="/brand/nivaro-n-exact.png" alt="" /></span>
            <span className="admin-brand-copy"><strong>NIVARO<span>BET</span></strong><small>ADMIN CONTROL</small></span>
          </Link>


          <button
            type="button"
            className="admin-mobile-close"
            aria-label="Close admin menu"
            onClick={closeMobileMenu}
          >
            <X size={21} />
          </button>

        </div>


        {/* =========================================
            NAVIGATION
        ========================================== */}

        <div
          style={{
            padding:
              "18px 14px 7px",
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: ".14em",
            color: "#606773",
            textTransform: "uppercase",
          }}
        >
          Administration
        </div>


        <nav className="admin-nav">
          {NAV.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(
                    item.href
                  );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active ? "active" : ""
                }
                onClick={
                  closeMobileMenu
                }
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>


        {/* =========================================
            SIGN OUT
        ========================================== */}

        <button
          type="button"
          className="admin-signout"
          onClick={handleSignOut}
        >
          <LogOut size={17} />

          <span>
            Sign out
          </span>
        </button>
      </aside>


      {/* =========================================
          MOBILE OVERLAY
      ========================================== */}

      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close admin menu"
          onClick={closeMobileMenu}
        />
      )}


      {/* =========================================
          MAIN AREA
      ========================================== */}

      <section className="admin-main">

        {/* MOBILE HEADER */}

        <div className="admin-mobile-bar">

          <Link
            href="/admin"
            className="admin-mobile-brand"
            onClick={closeMobileMenu}
          >
            <span className="admin-brand-mark" aria-hidden="true"><img src="/brand/nivaro-n-exact.png" alt="" /></span>
            <span className="admin-brand-copy"><strong>NIVARO<span>BET</span></strong><small>ADMIN</small></span>
          </Link>


          <button
            type="button"
            className="admin-mobile-menu-button"
            aria-label="Open admin menu"
            onClick={() =>
              setMobileMenuOpen(true)
            }
          >
            <Menu size={22} />
          </button>

        </div>


        <div className="admin-content">
          {children}
        </div>

      </section>
    </div>
  );
}


/* ============================================================
   ADMIN HEADER
============================================================ */

export function AdminHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="admin-header">

      <div
        className="admin-header-copy"
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <span className="eyebrow">
          <Shield size={15} />

          PRIVATE ADMIN
        </span>


        <h1
          style={{
            marginBottom:
              subtitle
                ? "10px"
                : 0,
          }}
        >
          {title}
        </h1>


        {subtitle && (
          <p
            style={{
              margin: 0,
              maxWidth: "760px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>


      <span className="secure-badge">
        <Shield size={14} />

        Authorized access
      </span>

    </div>
  );
}


/* ============================================================
   ADMIN TABLE
============================================================ */

export function AdminTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (
    | string
    | React.ReactNode
  )[][];
}) {
  return (
    <div
      className="admin-table-wrap"
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling:
          "touch",
      }}
    >
      <table
        className="admin-table"
        style={{
          width: "100%",
          minWidth: "620px",
        }}
      >
        <thead>
          <tr>
            {headers.map(
              (header) => (
                <th key={header}>
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>


        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={
                  headers.length
                }
                className="empty-cell"
                style={{
                  textAlign:
                    "center",
                  padding:
                    "28px 16px",
                }}
              >
                No records yet
              </td>
            </tr>
          ) : (
            rows.map(
              (
                row,
                rowIndex
              ) => (
                <tr
                  key={
                    rowIndex
                  }
                >
                  {row.map(
                    (
                      cell,
                      cellIndex
                    ) => (
                      <td
                        key={cellIndex}
                        data-label={headers[cellIndex]}
                        style={{
                          overflowWrap:
                            "anywhere",
                          verticalAlign:
                            "middle",
                        }}
                      >
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


/* ============================================================
   ADMIN FORM FIELD
============================================================ */

export function AdminFormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  as = "input",
  options,
  rows,
}: {
  label: string;
  name: string;
  type?: string;

  defaultValue?:
    | string
    | number
    | boolean;

  required?: boolean;

  as?:
    | "input"
    | "textarea"
    | "select"
    | "checkbox";

  options?: {
    value: string;
    label: string;
  }[];

  rows?: number;
}) {
  const val =
    defaultValue === true
      ? "on"
      : defaultValue === false
        ? undefined
        : defaultValue;


  /* TEXTAREA */

  if (as === "textarea") {
    return (
      <label className="admin-field">

        <span>
          {label}

          {required &&
            " *"}
        </span>


        <textarea
          name={name}
          defaultValue={String(
            val ?? ""
          )}
          rows={rows || 4}
          required={required}
        />

      </label>
    );
  }


  /* SELECT */

  if (as === "select") {
    return (
      <label className="admin-field">

        <span>
          {label}

          {required &&
            " *"}
        </span>


        <select
          name={name}
          defaultValue={String(
            val ?? ""
          )}
          required={required}
        >
          {options?.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {option.label}
              </option>
            )
          )}
        </select>

      </label>
    );
  }


  /* CHECKBOX */

  if (as === "checkbox") {
    return (
      <label
        className="admin-field admin-checkbox"
      >
        <input
          type="checkbox"
          name={name}
          defaultChecked={Boolean(
            defaultValue
          )}
        />

        <span>
          {label}
        </span>
      </label>
    );
  }


  /* STANDARD INPUT */

  return (
    <label className="admin-field">

      <span>
        {label}

        {required &&
          " *"}
      </span>


      <input
        name={name}
        type={type}
        defaultValue={String(
          val ?? ""
        )}
        required={required}
        step={
          type === "number"
            ? "0.1"
            : undefined
        }
      />

    </label>
  );
}