import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

async function requireSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// PATCH /api/admin/collections/reorder
// body: { items: [{ id, display_order }] }
export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await request.json() as { items: { id: number; display_order: number }[] };
  if (!Array.isArray(items)) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const admin = supabaseAdmin();
  await Promise.all(
    items.map(({ id, display_order }) =>
      admin.from("collections").update({ display_order }).eq("id", id)
    )
  );

  return NextResponse.json({ ok: true });
}
