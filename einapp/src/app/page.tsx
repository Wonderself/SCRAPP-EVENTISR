"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("סיסמה לא נכונה 🙈");
      }
    } catch {
      setError("שגיאה בחיבור");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dolphin-ocean-light via-dolphin-cream to-dolphin-sand-light p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-2">🐬</div>
        <h1 className="text-3xl font-bold text-dolphin-ocean-dark mb-1">
          Einapp
        </h1>
        <p className="text-dolphin-earth text-lg mb-6">שלום עינת! 💛</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            className="w-full px-4 py-3 rounded-xl border border-dolphin-sand focus:border-dolphin-ocean focus:outline-none focus:ring-2 focus:ring-dolphin-ocean-light text-center text-lg bg-dolphin-cream"
            autoFocus
          />

          {error && (
            <p className="text-dolphin-urgent text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-dolphin-ocean text-white text-lg font-semibold hover:bg-dolphin-ocean-dark transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "כניסה"}
          </button>
        </form>

        <p className="mt-6 text-dolphin-sand-dark text-sm">
          Good Vibes Only 🌊
        </p>
      </div>
    </div>
  );
}
