"use client";

/**
 * Auth callback — handles ALL Supabase auth redirect types:
 *
 * 1. Implicit flow (magic link default):
 *    https://fisayoview.com/auth/callback
 *      #access_token=xxx&refresh_token=yyy&token_type=bearer&type=magiclink
 *
 * 2. PKCE flow (future-proof):
 *    https://fisayoview.com/auth/callback?code=xxx
 *
 * 3. Rescue: tokens land on any page (e.g. homepage) when Supabase Site URL
 *    is misconfigured. NavigationRestorer forwards them here with the hash
 *    intact so this handler can process them normally.
 *
 * On success → /admin/dashboard
 * On failure → /admin/login?error=auth_callback_failed
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

      // ── 1. Hash fragment (implicit flow — what magic links produce) ──────────
      const hash   = window.location.hash.slice(1); // strip leading #
      const params = new URLSearchParams(hash);
      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const errorCode    = params.get("error_code");
      const errorDesc    = params.get("error_description");

      // Surface any Supabase-level errors embedded in the fragment
      if (errorCode) {
        const msg = errorDesc
          ? decodeURIComponent(errorDesc.replace(/\+/g, " "))
          : "Link expired or already used — request a new one.";
        setMessage(msg);
        setTimeout(() => router.replace("/admin/login?error=auth_callback_failed"), 2500);
        return;
      }

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
          // Clear the hash so tokens don't stay in the browser history
          window.history.replaceState(null, "", window.location.pathname);
          router.replace("/admin/dashboard");
          return;
        }
      }

      // ── 2. Query param (PKCE flow) ───────────────────────────────────────────
      const qp   = new URLSearchParams(window.location.search);
      const code = qp.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace("/admin/dashboard");
          return;
        }
        // If exchange fails, fall through to session check below
      }

      // ── 3. Already have a valid session (page refresh / direct nav) ──────────
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/admin/dashboard");
        return;
      }

      // ── Nothing worked ───────────────────────────────────────────────────────
      setMessage("Link expired or already used — request a new one.");
      setTimeout(() => router.replace("/admin/login?error=auth_callback_failed"), 2500);
    }

    handle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isExpired = message.startsWith("Link expired") || message.includes("expired");

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
