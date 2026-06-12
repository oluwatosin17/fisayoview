import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

async function requireSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// PATCH /api/admin/images/[id]/move
// body: { collection_id: number }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { collection_id } = await request.json() as { collection_id: number };
  if (!collection_id) return NextResponse.json({ error: "collection_id required" }, { status: 400 });

  const admin = supabaseAdmin();

  // Get current max sort_order in target collection
  const { data: maxRow } = await admin
    .from("images")
    .select("sort_order")
    .eq("collection_id", collection_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await admin
    .from("images")
    .update({ collection_id, sort_order })
    .eq("id", Number(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
