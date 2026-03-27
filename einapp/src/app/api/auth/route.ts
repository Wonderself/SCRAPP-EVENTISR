import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { setAppState } from "@/lib/db";

export async function POST(req: NextRequest) {
  let password: string;
  try {
    const body = await req.json();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const expected = process.env.APP_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: "APP_PASSWORD not configured" }, { status: 500 });
  }

  if (password === expected) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    setAppState(`session:${token}`, expiresAt);

    const res = NextResponse.json({ ok: true });
    res.cookies.set("einapp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
