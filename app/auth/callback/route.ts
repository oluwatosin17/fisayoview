import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Exchange failed — send to login with error
  return NextResponse.redirect(`${origin}/admin/login?error=auth_callback_failed`);
}
