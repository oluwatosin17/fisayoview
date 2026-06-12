"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/admin/Toast";

interface SiteSettings {
  instagram_url?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  about_heading?: string | null;
}

const inp: React.CSSProperties = {
  background: "#0d0d0d",
  border: "1px solid #222",
  color: "#fff",
  borderRadius: "10px",
  padding: "12px 16px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
};
const lbl: React.CSSProperties = {
  color: "#555",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

export function SettingsForm({ initialData }: { initialData: SiteSettings | null }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [instagram, setInstagram] = useState(initialData?.instagram_url ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [heading, setHeading] = useState(initialData?.about_heading ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/site-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instagram_url: instagram, whatsapp, email, about_heading: heading }),
        });
        if (!res.ok) throw new Error("Save failed");
        toast.success("Settings saved");
      } catch {
        toast.error("Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "640px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>About Section Heading</label>
        <input value={heading} onChange={(e) => setHeading(e.target.value)} style={inp} placeholder="FISAYOVIEW" />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #1a1a1a" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Instagram URL</label>
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} style={inp} placeholder="https://instagram.com/fisayoview" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>WhatsApp Number</label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inp} placeholder="+2348000000000" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={lbl}>Booking Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="bookfisayoview@gmail.com" />
      </div>

      <button type="submit" disabled={isPending}
        style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "#fff", color: "#000", border: "none", cursor: "pointer", opacity: isPending ? 0.7 : 1, alignSelf: "flex-start" }}>
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
