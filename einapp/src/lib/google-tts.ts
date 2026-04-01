// TTS uses a separate API key since Generative Language API keys can't access TTS
// Falls back to GOOGLE_CLOUD_API_KEY if GOOGLE_TTS_API_KEY not set
function getTTSKey(): string {
  return process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || "";
}

interface TTSResponse {
  audioContent: string; // base64
}

/**
 * Synthesize Hebrew text to audio using Google Cloud TTS.
 * Returns base64-encoded OGG audio (optimal for WhatsApp voice notes).
 * Falls back to MP3 for web playback.
 */
export async function synthesizeSpeech(
  text: string,
  format: "OGG_OPUS" | "MP3" = "MP3"
): Promise<Buffer | null> {
  const GOOGLE_API_KEY = getTTSKey();
  if (!GOOGLE_API_KEY) {
    console.log("[TTS] GOOGLE_CLOUD_API_KEY not configured");
    return null;
  }

  // Clean text for TTS (remove markdown, emojis, URLs)
  const cleanText = text
    .replace(/[#*_~`]/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleanText) return null;

  // Limit to 5000 chars (Google TTS limit per request)
  const truncated = cleanText.length > 5000 ? cleanText.substring(0, 5000) : cleanText;

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: truncated },
          voice: {
            languageCode: "he-IL",
            name: "he-IL-Wavenet-B", // Male Hebrew WaveNet voice
            ssmlGender: "MALE",
          },
          audioConfig: {
            audioEncoding: format,
            speakingRate: 1.1, // Slightly faster — more animated/expressive
            pitch: -1.5, // Lower pitch — warm masculine bestie energy
            // OGG_OPUS is perfect for WhatsApp voice notes
            // MP3 for web playback
            ...(format === "OGG_OPUS" ? { sampleRateHertz: 24000 } : {}),
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TTS] Google API error:", errText);
      return null;
    }

    const data: TTSResponse = await res.json();
    return Buffer.from(data.audioContent, "base64");
  } catch (error) {
    console.error("[TTS] Error:", error);
    return null;
  }
}

export function isTTSConfigured(): boolean {
  return !!getTTSKey();
}
