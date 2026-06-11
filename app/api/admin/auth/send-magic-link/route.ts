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
  // Dynamic redirect — works on both vercel.app and custom domains
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/auth/callback`;

  const { error } = await admin.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true, // Whitelist above is the gate; Supabase creates account on first login
    },
  });

  if (error) {
    console.error("[send-magic-link]", error.message);
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
