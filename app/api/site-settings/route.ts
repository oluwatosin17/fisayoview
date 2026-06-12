import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET() {
  const { data } = await supabase
    .from("site_settings")
    .select("instagram_url,whatsapp,email,about_heading,about_text,about_portraits,seo_title,seo_description,og_image")
    .limit(1)
    .single();
  return NextResponse.json(data ?? {});
}
