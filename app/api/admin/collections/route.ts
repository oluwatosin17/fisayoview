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

  const body = await request.json();
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from("collections")
    .insert([
      {
        name: body.name,
        slug: body.slug,
        category: body.category,
        description: body.description ?? null,
        featured: body.featured ?? false,
        display_order: body.display_order ?? 0,
        cover_cloudinary_id: body.cover_cloudinary_id ?? null,
        cover_url: body.cover_url ?? null,
        folder_name: body.slug,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
