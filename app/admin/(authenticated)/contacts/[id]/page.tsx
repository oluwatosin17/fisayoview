"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/admin/Toast";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  NEW:         { bg: "#3b82f622", color: "#60a5fa",  label: "New" },
  CONTACTED:   { bg: "#f59e0b22", color: "#fbbf24",  label: "Contacted" },
  IN_PROGRESS: { bg: "#a78bfa22", color: "#c4b5fd",  label: "In Progress" },
  BOOKED:      { bg: "#22c55e22", color: "#4ade80",  label: "Booked" },
  CLOSED:      { bg: "#6b728022", color: "#9ca3af",  label: "Closed" },
};

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string | null;
  event_type: string | null;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [contact, setContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/contacts/${id}`)
      .then((r) => r.json())
      .then((d: Contact) => { setContact(d); setNotes(d.notes ?? ""); })
      .catch(() => toast.error("Failed to load contact"));
  }, [id, toast]);

  async function updateStatus(status: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Failed to update"); return; }
    const updated: Contact = await res.json();
    setContact(updated);
    toast.success("Status updated");
  }

  function saveNotes() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) { toast.error("Failed to save notes"); return; }
      toast.success("Notes saved");
    });
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Delete failed"); return; }
    toast.success("Contact deleted");
    router.push("/admin/contacts");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if (!contact) {
    return (
      <div style={{ padding: "48px 48px" }}>
        <div style={{ fontSize: "14px", color: "#444" }}>Loading…</div>
      </div>
    );
  }

  const st = STATUS_STYLES[contact.status] ?? STATUS_STYLES.NEW;
  const waNumber = contact.phone.replace(/\D/g, "");
  const waText = encodeURIComponent(`Hi ${contact.name}! Thanks for reaching out about ${contact.event_type ?? "your enquiry"}. `);
  const mailSubject = encodeURIComponent(`Re: Your enquiry — ${contact.name}`);
  const mailBody = encodeURIComponent(`Hi ${contact.name},\n\nThank you for your enquiry.\n\n---\nOriginal message:\n${contact.message}`);

  const inp: React.CSSProperties = {
    background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#fff",
    borderRadius: "10px", padding: "12px 16px", fontSize: "14px", outline: "none", width: "100%",
  };

  return (
    <div style={{ padding: "48px 48px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px", fontSize: "13px" }}>
        <Link href="/admin/contacts" style={{ color: "#555", textDecoration: "none" }}>Contacts</Link>
        <span style={{ color: "#333" }}>/</span>
        <span style={{ color: "#fff" }}>{contact.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "36px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{contact.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.color}44` }}>
              {st.label}
            </span>
            <span style={{ fontSize: "13px", color: "#444" }}>Submitted {formatDate(contact.created_at)}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a href={`https://wa.me/${waNumber}?text=${waText}`} target="_blank" rel="noopener noreferrer"
            style={{ padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: "#22c55e22", color: "#4ade80", border: "1px solid #22c55e33", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            WhatsApp ↗
          </a>
          <a href={`mailto:${contact.email}?subject=${mailSubject}&body=${mailBody}`}
            style={{ padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: "#3b82f622", color: "#60a5fa", border: "1px solid #3b82f633", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            Email ↗
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
        {/* Left: details + message */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Contact info card */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: 0 }}>Contact Info</p>
            {[
              { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
              { label: "Phone", value: contact.phone, href: `tel:${contact.phone}` },
              { label: "Location", value: contact.location ?? "—" },
              { label: "Service / Event", value: contact.event_type ?? "—" },
            ].map(({ label, value, href }) => (
              <div key={label} style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#444", width: "110px", flexShrink: 0, paddingTop: "2px" }}>{label}</span>
                {href ? (
                  <a href={href} style={{ fontSize: "14px", color: "#fff", textDecoration: "none" }}>{value}</a>
                ) : (
                  <span style={{ fontSize: "14px", color: "#fff" }}>{value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Message card */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: "0 0 14px" }}>Message</p>
            <p style={{ fontSize: "14px", color: "#ccc", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap" }}>{contact.message}</p>
          </div>

          {/* Notes card */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: "0 0 14px" }}>Internal Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Add private notes… (only visible here)"
              style={{ ...inp, resize: "vertical", lineHeight: "1.6", marginBottom: "12px" }}
            />
            <button type="button" onClick={saveNotes} disabled={isPending}
              style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", border: "none", cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>

        {/* Right: status + actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Status panel */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: "0 0 14px" }}>Lead Status</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["NEW", "CONTACTED", "IN_PROGRESS", "BOOKED", "CLOSED"].map((s) => {
                const sty = STATUS_STYLES[s];
                const active = contact.status === s;
                return (
                  <button key={s} type="button" onClick={() => updateStatus(s)}
                    style={{
                      padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", textAlign: "left",
                      background: active ? sty.bg : "transparent",
                      color: active ? sty.color : "#555",
                      border: `1px solid ${active ? sty.color + "44" : "#1e1e1e"}`,
                      transition: "all 0.15s",
                    }}>
                    {active ? "✓ " : ""}{sty.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", margin: "0 0 14px" }}>Actions</p>
            {showDelete ? (
              <div>
                <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Permanently delete this contact?</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={handleDelete}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444", cursor: "pointer" }}>
                    Delete
                  </button>
                  <button type="button" onClick={() => setShowDelete(false)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", background: "#111", color: "#555", border: "1px solid #1e1e1e", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowDelete(true)}
                style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", background: "transparent", color: "#ef4444", border: "1px solid #ef444433", cursor: "pointer" }}>
                Delete contact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
