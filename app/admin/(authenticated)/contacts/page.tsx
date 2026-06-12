import { supabaseAdmin } from "@/lib/supabase";
import ContactsClient from "./ContactsClient";

export const dynamic = "force-dynamic";

async function getContacts() {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("contact_submissions")
    .select("id,name,email,phone,event_type,message,status,created_at,updated_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getStats() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("contact_submissions").select("status");
  const all = data ?? [];
  return {
    total: all.length,
    new: all.filter((r: { status: string }) => r.status === "NEW").length,
    contacted: all.filter((r: { status: string }) => r.status === "CONTACTED").length,
    booked: all.filter((r: { status: string }) => r.status === "BOOKED").length,
    closed: all.filter((r: { status: string }) => r.status === "CLOSED").length,
  };
}

export default async function ContactsPage() {
  const [contacts, stats] = await Promise.all([getContacts(), getStats()]);
  return (
    <div style={{ padding: "48px 56px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
          Contacts
        </h1>
        <p style={{ fontSize: "14px", color: "#555", margin: "6px 0 0" }}>
          Lead management — all enquiries from the contact form
        </p>
      </div>
      <ContactsClient initialContacts={contacts} stats={stats} />
    </div>
  );
}
