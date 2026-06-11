"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "sent" | "error";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [email, setEmail]       = useState("");
  const [status, setStatus]     = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState(
    callbackError === "auth_callback_failed"
      ? "Link expired — request a new one below."
      : ""
  );
  const [provider, setProvider] = useState<"resend" | "supabase" | null>(null);

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

      setProvider(data.provider ?? "supabase");
      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div style={{
      display: "flex", minHeight: "100vh", alignItems: "center",
      justifyContent: "center", padding: "16px", background: "#0a0a0a"
    }}>
      <div style={{
        background: "#111", border: "1px solid #1a1a1a",
        borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "360px"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#fff", width: 52, height: 52, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/logo-black.png" alt="FV" width={36} height={36} style={{ objectFit: "contain" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>FISAYOVIEW</p>
            <p style={{ color: "#808080", fontSize: "12px", margin: "4px 0 0" }}>Admin Panel</p>
          </div>
        </div>

        {/* ── Sent state ── */}
        {status === "sent" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "#22c55e22", color: "#22c55e",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", margin: "0 auto 16px"
            }}>✓</div>

            <p style={{ color: "#fff", fontWeight: 500, margin: "0 0 8px", fontSize: "15px" }}>
              Check your email
            </p>
            <p style={{ color: "#808080", fontSize: "13px", lineHeight: 1.6, margin: "0 0 20px" }}>
              We sent a sign-in link to<br />
              <strong style={{ color: "#fff" }}>{email}</strong>
            </p>

            {/* Supabase email warning */}
            {provider === "supabase" && (
              <div style={{
                background: "#f59e0b11", border: "1px solid #f59e0b33",
                borderRadius: "8px", padding: "12px 14px", marginBottom: "20px", textAlign: "left"
              }}>
                <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#f59e0b", fontWeight: 500 }}>
                  ⚠ Check your Spam folder
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#808080", lineHeight: 1.5 }}>
                  Gmail often filters Supabase emails. Look in
                  <strong style={{ color: "#fff" }}> Spam</strong> or the
                  <strong style={{ color: "#fff" }}> Promotions</strong> tab.<br /><br />
                  Search for: <code style={{ color: "#fff", fontSize: "11px" }}>from:noreply@mail.supabase.io</code>
                </p>
              </div>
            )}

            <button
              onClick={() => { setStatus("idle"); setProvider(null); }}
              style={{ color: "#555", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Try a different email
            </button>
          </div>
        )}

        {/* ── Form ── */}
        {status !== "sent" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="email" style={{ display: "block", color: "#808080", fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>
                Email address
              </label>
              <input
                id="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="bookfisayoview@gmail.com"
                style={{
                  width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a",
                  color: "#fff", borderRadius: "8px", padding: "12px 14px",
                  fontSize: "14px", outline: "none", boxSizing: "border-box"
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#333"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
              />
            </div>

            {(status === "error" || errorMsg) && (
              <p style={{
                background: "#ef444411", color: "#ef4444",
                border: "1px solid #ef444433", borderRadius: "8px",
                padding: "10px 12px", fontSize: "13px", margin: 0
              }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit" disabled={status === "loading"}
              style={{
                width: "100%", background: "#fff", color: "#000", border: "none",
                borderRadius: "8px", padding: "13px 0", fontSize: "14px",
                fontWeight: 600, cursor: "pointer",
                opacity: status === "loading" ? 0.7 : 1
              }}
            >
              {status === "loading" ? "Sending…" : "Send login link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
