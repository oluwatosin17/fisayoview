"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";

const STATUSES = ["ALL", "NEW", "CONTACTED", "IN_PROGRESS", "BOOKED", "CLOSED"] as const;

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  NEW:         { bg: "#3b82f622", color: "#60a5fa", label: "New" },
  CONTACTED:   { bg: "#f59e0b22", color: "#fbbf24", label: "Contacted" },
  IN_PROGRESS: { bg: "#a78bfa22", color: "#c4b5fd", label: "In Progress" },
  BOOKED:      { bg: "#22c55e22", color: "#4ade80", label: "Booked" },
  CLOSED:      { bg: "#6b728022", color: "#9ca3af", label: "Closed" },
};

const EVENT_TYPES = ["Birthday", "Wedding", "Graduation", "Studio", "Portrait", "Corporate", "Other"];

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  event_type: string | null;
  message: string;
  status: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

const inp: React.CSSProperties = {
  background: "#0a0a0a", border: "1px solid #222", color: "#fff",
  borderRadius: "8px", padding: "10px 14px", fontSize: "13px",
  outline: "none", width: "100%", lineHeight: 1.5,
};
const lbl: React.CSSProperties = {
  fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.08em", color: "#555", display: "block", marginBottom: "6px",
};

function AddLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Contact) => void }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", whatsapp: "",
    event_type: "", message: "", notes: "", status: "NEW",
  });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to create lead");
      }
      const created: Contact = await res.json();
      toast.success("Lead added");
      onCreated(created);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "20px",
        padding: "32px", width: "100%", maxWidth: "520px",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Add Lead</h2>
            <p style={{ fontSize: "13px", color: "#555", margin: "4px 0 0" }}>Manually create a new contact lead</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "4px" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div>
            <label style={lbl}>Full Name *</label>
            <input ref={nameRef} required value={form.name} onChange={(e) => set("name", e.target.value)} style={inp} placeholder="e.g. Sarah Johnson" />
          </div>

          {/* Email + Phone row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inp} placeholder="sarah@email.com" />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inp} placeholder="+234 800 000 0000" />
            </div>
          </div>

          {/* WhatsApp + Enquiry type row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>WhatsApp <span style={{ color: "#383838", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} style={inp} placeholder="If different from phone" />
            </div>
            <div>
              <label style={lbl}>Enquiry Type</label>
              <select value={form.event_type} onChange={(e) => set("event_type", e.target.value)}
                style={{ ...inp, appearance: "auto" as const }}>
                <option value="">— Select type —</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={lbl}>Initial Status</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(["NEW", "CONTACTED", "IN_PROGRESS", "BOOKED"] as const).map((s) => {
                const st = STATUS_STYLES[s];
                const active = form.status === s;
                return (
                  <button key={s} type="button" onClick={() => set("status", s)}
                    style={{
                      padding: "6px 12px", borderRadius: "7px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                      background: active ? st.bg : "transparent",
                      color: active ? st.color : "#555",
                      border: `1px solid ${active ? st.color + "44" : "#222"}`,
                    }}>
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
              style={{ ...inp, resize: "vertical" }} placeholder="Any additional details…" />
          </div>

          {/* Message / Description */}
          <div>
            <label style={lbl}>Message <span style={{ color: "#383838", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={2}
              style={{ ...inp, resize: "vertical" }} placeholder="Describe the enquiry…" />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
            <button type="submit" disabled={saving}
              style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Add Lead"}
            </button>
            <button type="button" onClick={onClose}
              style={{ padding: "10px 18px", borderRadius: "10px", fontSize: "13px", background: "#111", color: "#666", border: "1px solid #222", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type SortDir = "newest" | "oldest";

export default function ContactsClient({
  initialContacts,
}: {
  initialContacts: Contact[];
  stats: { total: number; new: number; contacted: number; booked: number; closed: number };
}) {
  const router = useRouter();
  const toast = useToast();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [sortDir, setSortDir] = useState<SortDir>("newest");
  const [showAddModal, setShowAddModal] = useState(false);

  const kpis = useMemo(() => ({
    total:     contacts.length,
    new:       contacts.filter((c) => c.status === "NEW").length,
    contacted: contacts.filter((c) => c.status === "CONTACTED").length,
    booked:    contacts.filter((c) => c.status === "BOOKED").length,
    closed:    contacts.filter((c) => c.status === "CLOSED").length,
  }), [contacts]);

  const filtered = useMemo(() => {
    let result = contacts;
    if (activeStatus !== "ALL") result = result.filter((c) => c.status === activeStatus);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortDir === "newest" ? db - da : da - db;
    });
    return result;
  }, [contacts, query, activeStatus, sortDir]);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Failed to update status"); return; }
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  function handleLeadCreated(c: Contact) {
    setContacts((prev) => [c, ...prev]);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div>
      {showAddModal && (
        <AddLeadModal onClose={() => setShowAddModal(false)} onCreated={handleLeadCreated} />
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total",     value: kpis.total,     color: "#fff"    },
          { label: "New",       value: kpis.new,       color: "#60a5fa" },
          { label: "Contacted", value: kpis.contacted, color: "#fbbf24" },
          { label: "Booked",    value: kpis.booked,    color: "#4ade80" },
          { label: "Closed",    value: kpis.closed,    color: "#9ca3af" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#555", margin: "0 0 12px" }}>{label}</p>
            <p style={{ fontSize: "36px", fontWeight: 600, color, letterSpacing: "-0.03em", margin: 0, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or phone…"
          style={{ ...{ background: "#0d0d0d", border: "1px solid #222", color: "#fff", borderRadius: "10px", padding: "9px 14px", fontSize: "13px", outline: "none" }, width: "240px" }}
        />

        {/* Status filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setActiveStatus(s)}
              style={{
                padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                background: activeStatus === s ? "#fff" : "#0d0d0d",
                color: activeStatus === s ? "#000" : "#555",
                border: `1px solid ${activeStatus === s ? "#fff" : "#222"}`,
              }}>
              {s === "ALL" ? "All" : (STATUS_STYLES[s]?.label ?? s)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button type="button" onClick={() => setSortDir((d) => d === "newest" ? "oldest" : "newest")}
          style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", background: "#0d0d0d", color: "#555", border: "1px solid #222", display: "flex", alignItems: "center", gap: "5px" }}>
          {sortDir === "newest" ? "↓ Newest" : "↑ Oldest"}
        </button>

        {/* Count */}
        <span style={{ fontSize: "13px", color: "#444" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>

        {/* Add lead */}
        <button type="button" onClick={() => setShowAddModal(true)}
          style={{ marginLeft: "auto", padding: "9px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: "#fff", color: "#000", border: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          + Add Lead
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", color: "#1e1e1e", margin: "0 0 16px" }}>✉</p>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "#555", margin: "0 0 20px" }}>
            {contacts.length === 0 ? "No leads yet" : "No results for this filter"}
          </p>
          {contacts.length === 0 && (
            <button type="button" onClick={() => setShowAddModal(true)}
              style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", border: "none", cursor: "pointer" }}>
              + Add your first lead
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.4fr 1fr 140px 120px 130px 110px 24px",
            padding: "12px 24px", borderBottom: "1px solid #161616", background: "#080808",
            alignItems: "center",
          }}>
            {["Name", "Email", "Phone", "Type", "Status", "Date", ""].map((h) => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#444" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((c, i) => {
            const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.NEW;
            return (
              <div key={c.id}
                style={{
                  display: "grid", gridTemplateColumns: "1.4fr 1fr 140px 120px 130px 110px 24px",
                  padding: "16px 24px", borderBottom: i < filtered.length - 1 ? "1px solid #111" : "none",
                  alignItems: "center", cursor: "pointer", transition: "background 0.15s",
                }}
                onClick={() => router.push(`/admin/contacts/${c.id}`)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#fff", margin: 0, lineHeight: 1.3 }}>{c.name}</p>
                    {c.source === "manual" && (
                      <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px", background: "#a78bfa18", color: "#a78bfa", flexShrink: 0 }}>MANUAL</span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "#444", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.message ? (c.message.slice(0, 40) + (c.message.length > 40 ? "…" : "")) : "—"}
                  </p>
                </div>
                <span style={{ fontSize: "13px", color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email || "—"}</span>
                <span style={{ fontSize: "13px", color: "#777" }}>{c.phone || "—"}</span>
                <span style={{ fontSize: "12px", color: "#555" }}>{c.event_type ?? "—"}</span>

                {/* Inline status — stop row click */}
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    style={{
                      padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600,
                      background: st.bg, color: st.color, border: `1px solid ${st.color}44`,
                      cursor: "pointer", outline: "none",
                    }}
                  >
                    {["NEW", "CONTACTED", "IN_PROGRESS", "BOOKED", "CLOSED"].map((s) => (
                      <option key={s} value={s} style={{ background: "#111", color: "#fff" }}>
                        {STATUS_STYLES[s]?.label ?? s}
                      </option>
                    ))}
                  </select>
                </div>

                <span style={{ fontSize: "12px", color: "#444" }}>{formatDate(c.created_at)}</span>
                <span style={{ fontSize: "14px", color: "#333" }}>›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
