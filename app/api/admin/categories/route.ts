import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("collections")
    .select("category")
    .order("category");

  const categories = Array.from(new Set((data ?? []).map((r: { category: string }) => r.category))).sort();
  return NextResponse.json(categories);
}
