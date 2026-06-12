import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";

async function requireSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = supabaseAdmin();

  const { data: existing } = await admin.from("site_settings").select("id").limit(1).single();

  let data, error;
  if (existing) {
    ({ data, error } = await admin.from("site_settings").update(body).eq("id", existing.id).select().single());
  } else {
    ({ data, error } = await admin.from("site_settings").insert([body]).select().single());
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/about");
  revalidatePath("/");
  return NextResponse.json(data);
}
