"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState(
    callbackError === "auth_callback_failed"
      ? "Magic link expired or invalid. Please try again."
      : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#0a0a0a" }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center justify-center rounded-xl" style={{ background: "#fff", width: 52, height: 52 }}>
            <Image src="/logo-black.png" alt="FV" width={36} height={36} style={{ objectFit: "contain" }} />
          </div>
          <div className="text-center">
            <p className="tracking-widest text-xs font-semibold" style={{ color: "#fff", letterSpacing: "0.2em" }}>
              FISAYOVIEW
            </p>
            <p className="text-xs mt-1" style={{ color: "#808080" }}>Admin Panel</p>
          </div>
        </div>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl"
              style={{ background: "#22c55e22", color: "#22c55e" }}>✓</div>
            <p className="font-medium mb-2" style={{ color: "#fff" }}>Check your email</p>
            <p className="text-sm" style={{ color: "#808080" }}>
              We sent a magic link to <strong style={{ color: "#fff" }}>{email}</strong>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-xs mb-2 font-medium" style={{ color: "#808080" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#fff" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#333"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
              />
            </div>

            {(status === "error" || errorMsg) && (
              <p className="text-xs rounded-lg px-3 py-2"
                style={{ background: "#ef444411", color: "#ef4444", border: "1px solid #ef444433" }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg py-3 text-sm font-semibold cursor-pointer"
              style={{ background: "#fff", color: "#000", opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
