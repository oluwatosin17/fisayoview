import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

async function requireSession() {
  const sb = await createSupabaseServerClient();
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const admin = supabaseAdmin();
  let query = admin
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "ALL") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let result = data ?? [];
  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(
      (r: { name: string; email: string; phone: string }) =>
        r.name.toLowerCase().includes(lower) ||
        r.email.toLowerCase().includes(lower) ||
        r.phone.includes(lower)
    );
  }

  return NextResponse.json(result);
}
