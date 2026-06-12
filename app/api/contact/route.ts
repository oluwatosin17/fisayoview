import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, location, event_type, message } = body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const { error } = await supabase.from("contact_submissions").insert([{
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    location: location?.trim() || null,
    event_type: event_type?.trim() || null,
    message: message.trim(),
    status: "NEW",
  }]);

  if (error) {
    console.error("[contact]", error.message);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
