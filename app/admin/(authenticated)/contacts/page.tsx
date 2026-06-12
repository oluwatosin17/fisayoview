import { supabaseAdmin } from "@/lib/supabase";
import ContactsClient from "./ContactsClient";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

async function getContacts() {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("contact_submissions")
    .select("id,name,email,phone,whatsapp,event_type,message,status,source,created_at,updated_at")
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
    <div className="admin-page" style={{ maxWidth: "1200px" }}>
      <PageHeader title="Contacts" description="Lead management — website enquiries and manually added leads" />
      <ContactsClient initialContacts={contacts} stats={stats} />
    </div>
  );
}
