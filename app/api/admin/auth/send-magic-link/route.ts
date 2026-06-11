import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

  // generateLink uses the service-role key — no per-user rate limits, always works.
  // We return the link directly (safe for this private 2-person admin panel).
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error("[send-magic-link]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
  }

  return NextResponse.json({ link: actionLink });
}
