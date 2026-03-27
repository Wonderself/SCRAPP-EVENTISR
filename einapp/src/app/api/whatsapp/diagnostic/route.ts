import { NextRequest, NextResponse } from "next/server";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_BASE = `https://graph.facebook.com/v21.0`;

async function rawSend(to: string, text: string) {
  const res = await fetch(`${API_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, response: data };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const einatPhone = process.env.EINAT_PHONE_NUMBER || "";
  const devPhone = process.env.DEV_PHONE_NUMBER || "";

  const results: any = {
    config: {
      WHATSAPP_PHONE_NUMBER_ID: PHONE_NUMBER_ID || "NOT SET",
      WHATSAPP_ACCESS_TOKEN: ACCESS_TOKEN ? `${ACCESS_TOKEN.slice(0, 10)}...${ACCESS_TOKEN.slice(-4)}` : "NOT SET",
      EINAT_PHONE_NUMBER: einatPhone || "NOT SET",
      DEV_PHONE_NUMBER: devPhone || "NOT SET",
    },
    tests: {},
  };

  // Test 1: Send to Einat
  if (einatPhone) {
    results.tests.einat = await rawSend(einatPhone, "Test Einapp diagnostic — Einat 🐬");
  } else {
    results.tests.einat = { error: "EINAT_PHONE_NUMBER not configured" };
  }

  // Test 2: Send to Dev
  if (devPhone) {
    results.tests.dev = await rawSend(devPhone, "Test Einapp diagnostic — Dev 🔧");
  } else {
    results.tests.dev = { error: "DEV_PHONE_NUMBER not configured" };
  }

  return NextResponse.json(results, { status: 200 });
}
