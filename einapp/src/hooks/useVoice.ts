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

    // Check if Google TTS is available
    fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "test" }) })
      .then((r) => {
        if (r.ok || r.status === 400) {
          // API exists - check if configured (503 = not configured)
          setTtsMode(r.status === 503 ? (hasSynthesis ? "browser" : "none") : "google");
        } else if (r.status === 503) {
          setTtsMode(hasSynthesis ? "browser" : "none");
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find(
      (v) => v.lang.startsWith("he") || v.lang.startsWith("iw")
    );
    if (hebrewVoice) utterance.voice = hebrewVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
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
