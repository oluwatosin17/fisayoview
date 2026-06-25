import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

// Use the canonical site URL so the redirectTo is always correct regardless
// of how Vercel/Next.js sets request.url internally (can be an internal IP).
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??   // set this in Vercel env
  process.env.NEXT_PUBLIC_SUPABASE_URL   // fallback: not ideal but better than nothing
    ?.replace(/supabase\.co.*/, "")      // strip supabase domain just in case
  ?? "https://fisayoview.com";           // hard fallback

const ADMIN_EMAILS = ["bookfisayoview@gmail.com", "obalanatosin16@gmail.com"];

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  // Always use the canonical domain — never derive from request.url which
  // can be an internal Vercel/Next.js hostname in serverless environments.
  const redirectTo = `${SITE_URL}/auth/callback`;

  // ── Option A: Resend (best deliverability, arrives in inbox) ────────────────
  if (process.env.RESEND_API_KEY) {
    // generateLink has no rate limits and doesn't conflict with email sending
    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError || !data.properties?.action_link) {
      return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
    }

    const actionLink = data.properties.action_link;
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: sendError } = await resend.emails.send({
      from: "FISAYOVIEW Admin <onboarding@resend.dev>",
      to: [email],
      subject: "Sign in to FISAYOVIEW Admin",
      html: buildEmail(actionLink),
    });

    if (sendError) {
      console.error("[magic-link] Resend error:", sendError.message);
      // Fall through to Supabase email below
    } else {
      return NextResponse.json({ emailSent: true, provider: "resend" });
    }
  }

  // ── Option B: Supabase email (may land in Gmail spam — tell user to check) ──
  const { error: otpError } = await admin.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });

  if (otpError) {
    const isRateLimit = otpError.status === 429 ||
      otpError.message.toLowerCase().includes("rate limit") ||
      otpError.message.toLowerCase().includes("after");

    if (isRateLimit) {
      const secs = otpError.message.match(/(\d+)\s*second/i)?.[1] ?? "60";
      return NextResponse.json(
        { error: `Please wait ${secs} seconds before requesting another link.` },
        { status: 429 }
      );
    }

    console.error("[magic-link] signInWithOtp error:", otpError.message);
    return NextResponse.json({ error: otpError.message }, { status: 500 });
  }

  // Email sent via Supabase — warn user to check spam
  return NextResponse.json({ emailSent: true, provider: "supabase" });
}

function buildEmail(link: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:48px 24px;">
    <table role="presentation" style="max-width:480px;width:100%;" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:28px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.18em;color:#555;text-transform:uppercase;font-weight:600;">FISAYOVIEW</p>
      </td></tr>
      <tr><td style="border:1px solid #1a1a1a;border-radius:12px;padding:32px;background:#111;">
        <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#fff;">Admin sign-in</p>
        <p style="margin:0 0 28px;font-size:14px;color:#808080;line-height:1.6;">
          Click the button below to sign in to the FISAYOVIEW admin dashboard.<br>
          This link expires in <strong style="color:#fff;">1 hour</strong> and works once only.
        </p>
        <a href="${link}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;">Sign in to Admin →</a>
        <p style="margin:28px 0 0;font-size:11px;color:#333;line-height:1.7;">
          If the button doesn't work, paste this link into your browser:<br>
          <a href="${link}" style="color:#555;word-break:break-all;">${link}</a>
        </p>
      </td></tr>
      <tr><td style="padding-top:20px;">
        <p style="margin:0;font-size:11px;color:#333;">If you didn't request this, you can safely ignore it.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
