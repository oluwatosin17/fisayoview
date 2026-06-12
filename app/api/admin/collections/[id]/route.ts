import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

async function requireSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const admin = supabaseAdmin();

  const updateData: Record<string, unknown> = {};
  if ("name" in body) updateData.name = body.name;
  if ("slug" in body) updateData.slug = body.slug;
  if ("category" in body) updateData.category = body.category;
  if ("description" in body) updateData.description = body.description ?? null;
  if ("featured" in body) updateData.featured = body.featured ?? false;
  if ("display_order" in body) updateData.display_order = body.display_order ?? 0;
  if ("cover_cloudinary_id" in body) updateData.cover_cloudinary_id = body.cover_cloudinary_id ?? null;
  if ("cover_url" in body) updateData.cover_url = body.cover_url ?? null;

  const { data, error } = await admin
    .from("collections")
    .update(updateData)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/admin/collections");
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = supabaseAdmin();

  const { error } = await admin.from("collections").delete().eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/collections");
  return NextResponse.json({ success: true });
}
