import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

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
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/auth/callback`;

  // generateLink — admin key, no rate limits, always works instantly
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error("[magic-link] generateLink:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return NextResponse.json({ error: "Failed to generate login link" }, { status: 500 });
  }

  // ── Try to also send an email (best-effort, non-blocking) ──────────────────
  let emailSent = false;

  // Option A: Resend (best deliverability)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: "FISAYOVIEW Admin <onboarding@resend.dev>",
      to: [email],
      subject: "Sign in to FISAYOVIEW Admin",
      html: magicLinkEmail(actionLink),
    });
    if (!sendError) emailSent = true;
    else console.error("[magic-link] Resend error:", sendError.message);
  }

  // Option B: Supabase email (fallback — may go to spam, ignore rate-limit errors)
  if (!emailSent) {
    const { error: otpError } = await admin.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    if (!otpError) {
      emailSent = true;
    } else {
      // Rate limit is fine — user still gets the in-browser link
      console.warn("[magic-link] signInWithOtp:", otpError.message);
    }
  }

  // Always return the link — guaranteed login regardless of email delivery
  return NextResponse.json({
    link: actionLink,
    emailSent,
  });
}

function magicLinkEmail(link: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:48px 24px;">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
      <tr><td style="padding-bottom:32px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.18em;color:#555;text-transform:uppercase;font-weight:600;">FISAYOVIEW</p>
      </td></tr>
      <tr><td style="border:1px solid #1a1a1a;border-radius:12px;padding:32px;background:#111;">
        <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#fff;">Admin sign-in</p>
        <p style="margin:0 0 28px;font-size:14px;color:#808080;line-height:1.6;">
          Click the button below to sign in to the FISAYOVIEW admin dashboard.
          This link expires in <strong style="color:#fff;">1 hour</strong> and works once only.
        </p>
        <a href="${link}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;">Sign in to Admin →</a>
        <p style="margin:28px 0 0;font-size:11px;color:#333;line-height:1.7;">
          If the button doesn't work, paste this URL into your browser:<br>
          <a href="${link}" style="color:#555;word-break:break-all;">${link}</a>
        </p>
      </td></tr>
      <tr><td style="padding-top:24px;">
        <p style="margin:0;font-size:11px;color:#333;">If you didn't request this, you can safely ignore it.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
