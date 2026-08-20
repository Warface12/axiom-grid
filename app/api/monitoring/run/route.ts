import { NextRequest, NextResponse } from "next/server";

import { runScheduledMonitoringChecks } from "@/lib/actions/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Nivaro Automatic Casino Monitoring Endpoint
 *
 * This endpoint is intended for automated/server-side monitoring.
 * It does NOT require an Admin browser session.
 *
 * Security:
 * - Requires CRON_SECRET when configured.
 * - Vercel Cron can send:
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error(
        "Monitoring cron rejected: CRON_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Monitoring cron is not configured.",
        },
        {
          status: 503,
        }
      );
    }

    const authorization =
      request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      console.warn(
        "Unauthorized monitoring cron request."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const startedAt = new Date().toISOString();

    const result =
      await runScheduledMonitoringChecks();

    const finishedAt = new Date().toISOString();

    if (
      result &&
      typeof result === "object" &&
      "error" in result &&
      result.error
    ) {
      console.error(
        "Scheduled monitoring completed with an error:",
        result.error
      );

      return NextResponse.json(
        {
          success: false,
          startedAt,
          finishedAt,
          result,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        startedAt,
        finishedAt,
        result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Automatic monitoring endpoint failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Automatic monitoring failed.",
      },
      {
        status: 500,
      }
    );
  }
}