"use client";

import { useState, useMemo } from "react";
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

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  event_type: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ContactsClient({ initialContacts }: { initialContacts: Contact[]; stats: { total: number; new: number; contacted: number; booked: number; closed: number } }) {
  const router = useRouter();
  const toast = useToast();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("ALL");

  // Compute KPIs live from current contacts state so inline status changes reflect immediately
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
        c.phone.includes(q)
      );
    }
    return result;
  }, [contacts, query, activeStatus]);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Failed to update status"); return; }
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  const inp: React.CSSProperties = {
    background: "#0d0d0d", border: "1px solid #222", color: "#fff",
    borderRadius: "10px", padding: "11px 16px", fontSize: "13px", outline: "none",
  };

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "36px" }}>
        {[
          { label: "Total",     value: kpis.total,     color: "#fff"    },
          { label: "New",       value: kpis.new,       color: "#60a5fa" },
          { label: "Contacted", value: kpis.contacted, color: "#fbbf24" },
          { label: "Booked",    value: kpis.booked,    color: "#4ade80" },
          { label: "Closed",    value: kpis.closed,    color: "#9ca3af" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "24px 22px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#555", margin: "0 0 12px" }}>{label}</p>
            <p style={{ fontSize: "36px", fontWeight: 600, color, letterSpacing: "-0.03em", margin: 0, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or phone…"
          style={{ ...inp, width: "280px" }}
        />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setActiveStatus(s)}
              style={{
                padding: "9px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                background: activeStatus === s ? "#fff" : "#0d0d0d",
                color: activeStatus === s ? "#000" : "#555",
                border: `1px solid ${activeStatus === s ? "#fff" : "#222"}`,
              }}>
              {s === "ALL" ? "All" : (STATUS_STYLES[s]?.label ?? s)}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#444" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", color: "#1e1e1e", margin: "0 0 16px" }}>✉</p>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "#555", margin: 0 }}>
            {contacts.length === 0 ? "No enquiries yet" : "No results for this filter"}
          </p>
        </div>
      ) : (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "16px", overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.2fr 1fr 150px 120px 130px 130px",
            padding: "13px 28px", borderBottom: "1px solid #161616", background: "#080808",
          }}>
            {["Name", "Email", "Phone", "Type", "Status", "Date"].map((h) => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#444" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((c, i) => {
            const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.NEW;
            return (
              <div key={c.id}
                style={{
                  display: "grid", gridTemplateColumns: "1.2fr 1fr 150px 120px 130px 130px",
                  padding: "18px 28px", borderBottom: i < filtered.length - 1 ? "1px solid #111" : "none",
                  alignItems: "center", cursor: "pointer", transition: "background 0.15s",
                }}
                onClick={() => router.push(`/admin/contacts/${c.id}`)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#fff", margin: 0, lineHeight: 1.3 }}>{c.name}</p>
                  <p style={{ fontSize: "12px", color: "#444", margin: "4px 0 0" }}>{c.message.slice(0, 42)}{c.message.length > 42 ? "…" : ""}</p>
                </div>
                <span style={{ fontSize: "13px", color: "#777" }}>{c.email}</span>
                <span style={{ fontSize: "13px", color: "#777" }}>{c.phone}</span>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
