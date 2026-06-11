"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/admin/Toast";

interface SiteSettings {
  about_heading?: string | null;
  about_text?: string | null;
  instagram_url?: string | null;
  whatsapp?: string | null;
  email?: string | null;
}

export function AboutForm({ initialData }: { initialData: SiteSettings | null }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [heading, setHeading] = useState(initialData?.about_heading ?? "");
  const [text, setText] = useState(initialData?.about_text ?? "");
  const [instagram, setInstagram] = useState(initialData?.instagram_url ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/site-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            about_heading: heading,
            about_text: text,
            instagram_url: instagram,
            whatsapp,
            email,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        toast.success("About page saved");
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
        <label style={labelStyle}>Heading</label>
        <input value={heading} onChange={(e) => setHeading(e.target.value)} style={inputStyle} placeholder="About Fisayo" />
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Biography</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Tell your story…"
        />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #1a1a1a" }} />

      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Instagram URL</label>
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} style={inputStyle} placeholder="https://instagram.com/fisayoview" />
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>WhatsApp Number</label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={inputStyle} placeholder="+2348000000000" />
      </div>
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="bookfisayoview@gmail.com" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer self-start"
        style={{ background: "#fff", color: "#000", opacity: isPending ? 0.7 : 1 }}
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
