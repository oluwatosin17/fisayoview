"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "email_sent" | "link_ready" | "error";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState(
    callbackError === "auth_callback_failed"
      ? "Link expired or already used — generate a new one."
      : ""
  );
  const [loginLink, setLoginLink]   = useState("");
  const [warning, setWarning]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    setLoginLink("");
    setWarning("");

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

      if (data.success) {
        // Resend sent the email
        setStatus("email_sent");
      } else if (data.link) {
        // Fallback: show direct link
        setLoginLink(data.link);
        if (data.warning) setWarning(data.warning);
        setStatus("link_ready");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setLoginLink("");
    setWarning("");
  }

  const card: React.CSSProperties = {
    background: "#111",
    border: "1px solid #1a1a1a",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "360px",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "16px", background: "#0a0a0a" }}>
      <div style={card}>

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

        {/* ── Email sent ── */}
        {status === "email_sent" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#22c55e22", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", margin: "0 auto 16px" }}>✓</div>
            <p style={{ color: "#fff", fontWeight: 500, margin: "0 0 8px" }}>Check your email</p>
            <p style={{ color: "#808080", fontSize: "13px", lineHeight: 1.6, margin: "0 0 20px" }}>
              We sent a sign-in link to<br />
              <strong style={{ color: "#fff" }}>{email}</strong>
            </p>
            <p style={{ color: "#555", fontSize: "12px", margin: "0 0 20px" }}>
              Can&apos;t find it? Check your spam folder.
            </p>
            <button onClick={reset} style={{ color: "#808080", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Try a different email
            </button>
          </div>
        )}

        {/* ── Fallback direct link ── */}
        {status === "link_ready" && loginLink && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "16px 0", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#22c55e22", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>✓</div>
            <div>
              <p style={{ color: "#fff", fontWeight: 500, margin: "0 0 6px" }}>Your login link is ready</p>
              {warning && <p style={{ color: "#f59e0b", fontSize: "12px", margin: "0 0 6px" }}>{warning}</p>}
              <p style={{ color: "#808080", fontSize: "13px", margin: 0 }}>
                Signed in as <strong style={{ color: "#fff" }}>{email}</strong>
              </p>
            </div>
            <a href={loginLink} style={{ display: "block", width: "100%", background: "#fff", color: "#000", textDecoration: "none", padding: "12px 0", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
              Sign in to Admin →
            </a>
            <button onClick={reset} style={{ color: "#808080", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Use a different email
            </button>
          </div>
        )}

        {/* ── Form ── */}
        {(status === "idle" || status === "loading" || status === "error") && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="email" style={{ display: "block", color: "#808080", fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>
                Email address
              </label>
              <input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#fff", borderRadius: "8px", padding: "12px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#333"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
              />
            </div>

            {(status === "error" || errorMsg) && (
              <p style={{ background: "#ef444411", color: "#ef4444", border: "1px solid #ef444433", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", margin: 0 }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit" disabled={status === "loading"}
              style={{ width: "100%", background: "#fff", color: "#000", border: "none", borderRadius: "8px", padding: "13px 0", fontSize: "14px", fontWeight: 600, cursor: "pointer", opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Sending…" : "Send login link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
