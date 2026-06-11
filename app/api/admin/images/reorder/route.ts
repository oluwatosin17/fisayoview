import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

async function requireSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items }: { items: { id: number; sort_order: number }[] } = await request.json();
  const admin = supabaseAdmin();

  // Update each image sort_order
  await Promise.all(
    items.map(({ id, sort_order }) =>
      admin.from("images").update({ sort_order }).eq("id", id)
    )
  );

  return NextResponse.json({ success: true });
}
