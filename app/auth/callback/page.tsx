"use client";

/**
 * Auth callback — handles BOTH Supabase magic link flows:
 *
 *  Implicit flow  (email magic link):
 *    Supabase redirects here with  #access_token=xxx&refresh_token=yyy
 *    The browser Supabase client reads the hash fragment automatically.
 *
 *  PKCE flow  (if ever used from browser signInWithOtp):
 *    Supabase redirects here with  ?code=xxx
 *    We pass the code to exchangeCodeForSession.
 *
 * Both paths end at /admin/dashboard.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/admin/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function handleCallback() {
      // ── PKCE flow: ?code= in the query string ───────────────────────────────
      const params = new URLSearchParams(window.location.search);
      const code   = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage("Link expired — please request a new one.");
          setTimeout(() => router.push("/admin/login?error=auth_callback_failed"), 2000);
          return;
        }
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }

      // ── Implicit flow: #access_token= in the hash ───────────────────────────
      // The browser client picks this up automatically via getSession / onAuthStateChange.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }

      // Wait for the auth state change fired by the hash fragment
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: import("@supabase/supabase-js").AuthChangeEvent, session: import("@supabase/supabase-js").Session | null) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            router.push("/admin/dashboard");
            router.refresh();
          }
          if (event === "TOKEN_REFRESHED" && session) {
            subscription.unsubscribe();
            router.push("/admin/dashboard");
            router.refresh();
          }
        }
      );

      // Fallback: if nothing happens in 6 s, treat as expired
      setTimeout(() => {
        subscription.unsubscribe();
        setMessage("Link expired — please request a new one.");
        setTimeout(() => router.push("/admin/login?error=auth_callback_failed"), 2000);
      }, 6000);
    }

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      display: "flex", minHeight: "100vh", alignItems: "center",
      justifyContent: "center", background: "#0a0a0a"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "2px solid #333",
          borderTopColor: "#fff", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "#808080", fontFamily: "var(--font-geist-sans)", fontSize: "14px", margin: 0 }}>
          {message}
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
