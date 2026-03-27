"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSupported: boolean;
  ttsMode: "google" | "browser" | "none";
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [ttsMode, setTtsMode] = useState<"google" | "browser" | "none">("none");
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasSpeech = !!SpeechRecognition;
    const hasSynthesis = !!window.speechSynthesis;
    setIsSupported(hasSpeech || hasSynthesis);

    // Check if Google TTS is available with a real test
    fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "שלום" }) })
      .then((r) => {
        if (r.ok) {
          setTtsMode("google");
        } else {
          setTtsMode(hasSynthesis ? "browser" : "none");
        }
      })
      .catch(() => setTtsMode(hasSynthesis ? "browser" : "none"));

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "he-IL";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        setTranscript(final || interim);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // Not started
    }
    setIsListening(false);
  }, []);

  const speakWithGoogle = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch {
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowser(text);
    }
  }, []);

  const speakWithBrowser = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoices = voices.filter(
        (v) => v.lang.startsWith("he") || v.lang.startsWith("iw")
      );

      // Don't speak at all if no Hebrew voice (better than speaking French!)
      if (hebrewVoices.length === 0) {
        console.log("[Voice] No Hebrew voice found. Available:", voices.map((v) => `${v.name} (${v.lang})`).join(", "));
        return;
      }

      // Prefer male Hebrew voice: look for known male names or "male" keyword
      const maleNames = ["asaf", "male", "amit", "david", "daniel", "guy", "omer"];
      const femaleNames = ["carmit", "female", "yael", "noa", "dana", "michal", "lihi"];
      const maleVoice = hebrewVoices.find((v) => {
        const name = v.name.toLowerCase();
        return maleNames.some((m) => name.includes(m));
      });
      const nonFemaleVoice = hebrewVoices.find((v) => {
        const name = v.name.toLowerCase();
        return !femaleNames.some((f) => name.includes(f));
      });

      const chosenVoice = maleVoice || nonFemaleVoice || hebrewVoices[hebrewVoices.length - 1];
      console.log("[Voice] Using:", chosenVoice.name, "from", hebrewVoices.map((v) => v.name).join(", "));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "he-IL";
      utterance.voice = chosenVoice;
      utterance.rate = 1.1;
      utterance.pitch = 0.85; // Lower pitch = more masculine

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet — wait for them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => doSpeak();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (ttsMode === "google") {
      speakWithGoogle(text);
    } else if (ttsMode === "browser") {
      speakWithBrowser(text);
    }
  }, [ttsMode, speakWithGoogle, speakWithBrowser]);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported,
    ttsMode,
  };
}
