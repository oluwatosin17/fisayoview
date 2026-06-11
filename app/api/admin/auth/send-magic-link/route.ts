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

  // Generate magic link using admin key — no rate limits
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error("[send-magic-link] generateLink error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return NextResponse.json({ error: "Failed to generate login link" }, { status: 500 });
  }

  // If Resend is configured — send a proper email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: sendError } = await resend.emails.send({
      from: "FISAYOVIEW Admin <onboarding@resend.dev>",
      to: [email],
      subject: "Your FISAYOVIEW admin login link",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="background:#000;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;padding:40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
            <tr>
              <td style="padding-bottom:32px;">
                <p style="font-size:11px;letter-spacing:0.2em;color:#808080;text-transform:uppercase;margin:0;">FISAYOVIEW</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:24px;">
                <p style="font-size:22px;font-weight:500;margin:0;color:#fff;">Sign in to Admin</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <p style="font-size:14px;color:#808080;line-height:1.6;margin:0;">
                  Click the button below to sign in to your FISAYOVIEW admin dashboard.
                  This link expires in <strong style="color:#fff;">1 hour</strong> and can only be used once.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="${actionLink}"
                  style="display:inline-block;background:#fff;color:#000;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                  Sign in →
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <p style="font-size:11px;color:#444;line-height:1.6;margin:0;">
                  If the button doesn't work, copy and paste this URL into your browser:<br>
                  <span style="color:#666;word-break:break-all;">${actionLink}</span>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (sendError) {
      console.error("[send-magic-link] Resend error:", sendError.message);
      // Fall through — return link as fallback
      return NextResponse.json({
        link: actionLink,
        warning: "Email delivery failed — use the link below to sign in",
      });
    }

    return NextResponse.json({ success: true, message: "Check your email" });
  }

  // Resend not configured — return link directly (fallback)
  return NextResponse.json({ link: actionLink });
}
