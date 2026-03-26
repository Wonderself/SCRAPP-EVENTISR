import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.APP_PASSWORD || "2026";

  if (password === expected) {
    const token = crypto.randomBytes(32).toString("hex");
    const res = NextResponse.json({ ok: true });
    res.cookies.set("einapp_session", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
