const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_BASE = `https://graph.facebook.com/v21.0`;

export async function sendWhatsAppMessage(to: string, text: string) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log("[WhatsApp] Not configured. Message:", text.substring(0, 100));
    return;
  }

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

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[WhatsApp] Send error (${res.status}):`, errText);
    // Common: 190 = expired token, 131030 = recipient not in sandbox
    if (res.status === 401 || errText.includes("190")) {
      console.error("[WhatsApp] ACCESS TOKEN EXPIRED — regenerate in Meta Business Settings");
    }
  } else {
    console.log(`[WhatsApp] Message sent to ${to} OK`);
  }

  // Send copy to developer if configured
  const devPhone = process.env.DEV_PHONE_NUMBER;
  if (devPhone && devPhone !== to) {
    try {
      console.log(`[WhatsApp] Sending dev copy to ${devPhone}`);
      const devRes = await fetch(`${API_BASE}/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: devPhone,
          type: "text",
          text: { body: `[COPY → ${to}]\n${text}` },
        }),
      });
      if (!devRes.ok) {
        console.error("[WhatsApp] Dev copy error:", await devRes.text());
      } else {
        console.log("[WhatsApp] Dev copy sent OK");
      }
    } catch (e) {
      console.error("[WhatsApp] Dev copy fetch error:", e);
    }
  }
}

/**
 * Upload media to WhatsApp and get media_id.
 */
export async function uploadMedia(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string | null> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) return null;

  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("type", mimeType);
  formData.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

  try {
    const res = await fetch(`${API_BASE}/${PHONE_NUMBER_ID}/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: formData,
    });

    if (!res.ok) {
      console.error("[WhatsApp] Upload media error:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.id;
  } catch (error) {
    console.error("[WhatsApp] Upload media error:", error);
    return null;
  }
}

/**
 * Send a voice note (audio message) on WhatsApp.
 */
export async function sendWhatsAppVoiceNote(to: string, audioBuffer: Buffer): Promise<boolean> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log("[WhatsApp] Not configured for voice notes");
    return false;
  }

  // Upload the audio file first
  const mediaId = await uploadMedia(audioBuffer, "audio/ogg; codecs=opus", "voice.ogg");
  if (!mediaId) {
    console.error("[WhatsApp] Failed to upload voice note");
    return false;
  }

  // Send as audio message
  const res = await fetch(`${API_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "audio",
      audio: { id: mediaId },
    }),
  });

  if (!res.ok) {
    console.error("[WhatsApp] Send voice note error:", await res.text());
    return false;
  }

  return true;
}

export async function getMediaUrl(mediaId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const data = await res.json();
  return data.url;
}

export async function downloadMedia(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function isWhatsAppConfigured(): boolean {
  return !!(PHONE_NUMBER_ID && ACCESS_TOKEN);
}
