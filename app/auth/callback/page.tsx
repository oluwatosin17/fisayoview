"use client";

/**
 * Auth callback — handles the Supabase implicit-flow redirect:
 *   https://fisayoview.com/auth/callback
 *     #access_token=xxx&refresh_token=yyy&token_type=bearer&type=magiclink
 *
 * We manually extract the tokens from window.location.hash and call
 * supabase.auth.setSession() directly — the most reliable approach.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/admin/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    async function handle() {
      const supabase = createSupabaseBrowserClient();

      // ── 1. Hash fragment (implicit flow — what Supabase email magic links use) ──
      const hash = window.location.hash.slice(1);           // strip leading #
      const params = new URLSearchParams(hash);
      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("[callback] setSession error:", error.message);
          setMessage("Link expired — request a new one.");
          setTimeout(() => router.replace("/admin/login?error=auth_callback_failed"), 2000);
          return;
        }

        if (data.session) {
          // Clear the hash from the URL so the tokens aren't visible
          window.history.replaceState(null, "", window.location.pathname);
          router.replace("/admin/dashboard");
          return;
        }
      }

      // ── 2. Query param (PKCE flow — future-proof) ────────────────────────────
      const qp   = new URLSearchParams(window.location.search);
      const code = qp.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace("/admin/dashboard");
          return;
        }
      }

      // ── 3. Already have a session (page refresh / direct nav) ─────────────
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/admin/dashboard");
        return;
      }

      // Nothing worked
      setMessage("Link expired or already used — request a new one.");
      setTimeout(() => router.replace("/admin/login?error=auth_callback_failed"), 2500);
    }

    handle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isExpired = message.startsWith("Link expired");

  return (
    <div style={{
      display: "flex", minHeight: "100vh", alignItems: "center",
      justifyContent: "center", background: "#0a0a0a"
    }}>
      <div style={{ textAlign: "center", maxWidth: 300 }}>
        {!isExpired && (
          <div style={{
            width: 36, height: 36,
            border: "2px solid #222", borderTopColor: "#fff",
            borderRadius: "50%", animation: "spin 0.75s linear infinite",
            margin: "0 auto 20px"
          }} />
        )}
        {isExpired && (
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "#ef444422", color: "#ef4444",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", margin: "0 auto 16px"
          }}>✕</div>
        )}
        <p style={{
          color: isExpired ? "#ef4444" : "#808080",
          fontFamily: "var(--font-geist-sans), sans-serif",
          fontSize: "14px", margin: 0, lineHeight: 1.5
        }}>
          {message}
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
