"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "done" | "error";

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
  const [loginLink, setLoginLink] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    setLoginLink("");
    setEmailSent(false);

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

      setLoginLink(data.link);
      setEmailSent(data.emailSent ?? false);
      setStatus("done");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "16px", background: "#0a0a0a" }}>
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "360px" }}>

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

        {/* ── Done state: always show the sign-in button ── */}
        {status === "done" && loginLink && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Primary: click to sign in */}
            <a
              href={loginLink}
              style={{ display: "block", background: "#fff", color: "#000", textDecoration: "none", padding: "14px 0", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}
            >
              Sign in to Admin →
            </a>

            {/* Secondary: email status */}
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "12px 14px" }}>
              {emailSent ? (
                <p style={{ margin: 0, fontSize: "12px", color: "#808080", lineHeight: 1.6 }}>
                  ✓ A sign-in link was also sent to <strong style={{ color: "#fff" }}>{email}</strong>
                  <br />
                  <span style={{ color: "#555" }}>Check spam / Promotions if you don&apos;t see it.</span>
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: "12px", color: "#555", lineHeight: 1.6 }}>
                  No email sent — use the button above to sign in directly.
                </p>
              )}
            </div>

            <button
              onClick={() => { setStatus("idle"); setLoginLink(""); }}
              style={{ color: "#555", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "center" }}
            >
              Use a different email
            </button>
          </div>
        )}

        {/* ── Form ── */}
        {status !== "done" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label htmlFor="email" style={{ display: "block", color: "#808080", fontSize: "12px", fontWeight: 500, marginBottom: "8px" }}>
                Email address
              </label>
              <input
                id="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="bookfisayoview@gmail.com"
                style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#fff", borderRadius: "8px", padding: "12px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#333"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
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
              {status === "loading" ? "Generating link…" : "Get login link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
