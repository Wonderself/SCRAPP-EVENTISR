const GOOGLE_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

interface STTResponse {
  results?: {
    alternatives: { transcript: string; confidence: number }[];
  }[];
}

/**
 * Transcribe audio to Hebrew text using Google Cloud Speech-to-Text.
 * Accepts audio buffer (OGG/OPUS from WhatsApp, or other formats).
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  encoding: "OGG_OPUS" | "WEBM_OPUS" | "LINEAR16" | "FLAC" | "AMR" | "AMR_WB" = "OGG_OPUS",
  sampleRate = 16000
): Promise<string | null> {
  if (!GOOGLE_API_KEY) {
    console.log("[STT] GOOGLE_CLOUD_API_KEY not configured");
    return null;
  }

  try {
    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding,
            sampleRateHertz: sampleRate,
            languageCode: "he-IL",
            model: "default",
            enableAutomaticPunctuation: true,
          },
          audio: {
            content: audioBuffer.toString("base64"),
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[STT] Google API error:", errText);
      return null;
    }

    const data: STTResponse = await res.json();
    const transcript = data.results
      ?.map((r) => r.alternatives[0]?.transcript)
      .filter(Boolean)
      .join(" ");

    return transcript || null;
  } catch (error) {
    console.error("[STT] Error:", error);
    return null;
  }
}

export function isSTTConfigured(): boolean {
  return !!GOOGLE_API_KEY;
}
