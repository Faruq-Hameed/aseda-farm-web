import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Invoked once a day by Vercel Cron (see vercel.json). Vercel automatically sends
// `Authorization: Bearer $CRON_SECRET` on cron-triggered requests when CRON_SECRET
// is set as a project env var, which doubles as the wake-up call for the backend
// since it can spin down when idle.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/scheduler/trigger-daily`, {
    method: "POST",
    headers: { "x-cron-secret": process.env.CRON_SECRET },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Backend trigger failed", status: res.status },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
