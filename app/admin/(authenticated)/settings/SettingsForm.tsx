"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/admin/Toast";

interface SiteSettings {
  instagram_url?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  about_heading?: string | null;
}

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

  const inputStyle = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };
  const labelStyle = { color: "#808080", fontSize: "12px", fontWeight: 500 as const };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>About Section Heading</label>
        <input value={heading} onChange={(e) => setHeading(e.target.value)} style={inputStyle} placeholder="About Fisayo" />
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Instagram URL</label>
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} style={inputStyle} placeholder="https://instagram.com/fisayoview" />
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>WhatsApp Number</label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inputStyle} placeholder="+2348000000000" />
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Booking Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="bookfisayoview@gmail.com" />
      </div>

      <button type="submit" disabled={isPending} className="rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer self-start" style={{ background: "#fff", color: "#000", opacity: isPending ? 0.7 : 1 }}>
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
