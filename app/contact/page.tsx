"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import type { Category } from "@/lib/projects";

// Same portrait images used on the about page
const ABOUT_IMAGES = [
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9296", filename: "IMG_9296.jpg" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9297_copy", filename: "IMG_9297 copy.jpg" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9309", filename: "IMG_9309.jpg" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9322_copy", filename: "IMG_9322 copy.jpg" },
  { url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/S_PX1005_copy", filename: "S_PX1005 copy.jpg" },
];

const BIO = `I'm Obalana Fisayo — the lead photographer, creative and the mind behind fisayoview.

What you see on this page isn't just photography.
Its intention, It's detail, It's understanding people beyond the surface. Every frame I create is built on one thing and that's making you feel seen not just photographed.

From portraits to events, I focus on capturing moments in a way that actually means something because anyone can take a picture but not everyone can tell your story properly.

If you're new here, you're in the right place. Let's create something timeless.`;

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
}

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  outline: "none",
  fontSize: "12px",
  fontFamily: "var(--font-geist-sans)",
  fontWeight: 200,
  color: "#fff",
  lineHeight: "normal",
  padding: 0,
  caretColor: "#fff",
};

const placeholderStyle = `
  input::placeholder, textarea::placeholder { color: #888; }
  textarea { resize: none; }
  * { box-sizing: border-box; }
`;

export default function ContactPage() {
  const router = useRouter();
  const [bgIndex] = useState(0); // static background image
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", location: "", message: "",
  });
  const [sent, setSent] = useState(false);

  function handleClose() {
    router.back();
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSend() {
    const subject = encodeURIComponent(`Inquiry from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nLocation: ${form.location}\n\nMessage:\n${form.message}`
    );
    window.open(`mailto:bookfisayoview@gmail.com?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => router.push("/"), 1500);
  }

  return (
    <>
      <style>{placeholderStyle}</style>
      {/* Page wrapper — overflow hidden so background doesn't scroll */}
      <div style={{ background: "#000", height: "100vh", overflow: "hidden", position: "relative" }}>
        <Navbar
          activeCategory={"ALL" as Category}
          onCategoryChange={() => {}}
          allMuted
        />

        {/* About-page background (dimmed) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: "64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "124px 120px 60px", // 64px nav + 60px top content padding
          }}
        >
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            {/* Portrait */}
            <div style={{ width: "516px", height: "700px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
              <img
                src={ABOUT_IMAGES[bgIndex].url}
                alt="Fisayo"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* Bio */}
            <div style={{ width: "400px", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", alignSelf: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{ fontSize: "34px", fontFamily: "var(--font-geist-sans)", fontWeight: 400, color: "#fff", lineHeight: "normal", width: "455px" }}>
                    FISAYOVIEW
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 200, color: "#b3b3b3", lineHeight: "18px", whiteSpace: "nowrap" }}>
                      08136404224
                    </span>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#b3b3b3", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 200, color: "#b3b3b3", lineHeight: "18px", whiteSpace: "nowrap" }}>
                      bookfisayoview@gmail.com
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 200, color: "#fff", lineHeight: "18px", whiteSpace: "pre-wrap" }}>
                  {BIO}
                </p>
              </div>
              {/* Thumbnails */}
              <div style={{ display: "flex", gap: "6px" }}>
                {ABOUT_IMAGES.map((img, i) => (
                  <div key={i} style={{ position: "relative", width: "40px", height: "40px", borderRadius: "1.6px", overflow: "hidden", flexShrink: 0 }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "1.6px" }} />
                    {i !== 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)", borderRadius: "1.6px" }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />

        {/* Modal — centered on screen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: "500px",
              background: "#202020",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #292929",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--font-geist-sans)",
                  fontWeight: 400,
                  color: "#fff",
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                }}
              >
                Contact
              </span>
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{
                  width: "16px",
                  height: "16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#808080",
                  flexShrink: 0,
                }}
              >
                {/* close_circle_filled icon */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#333" />
                  <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body — fields */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {/* Row 1: Name | From (email) */}
              <div style={{ display: "flex", borderBottom: "1px solid #292929" }}>
                <div style={{ flex: 1, padding: "16px 20px", borderRight: "1px solid #292929" }}>
                  <input
                    type="text"
                    placeholder="Name: (enter full name)"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    style={inputBase}
                  />
                </div>
                <div style={{ flex: 1, padding: "16px 20px" }}>
                  <input
                    type="email"
                    placeholder="From: (enter your email address)"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={inputBase}
                  />
                </div>
              </div>

              {/* Row 2: Phone | Location */}
              <div style={{ display: "flex", borderBottom: "1px solid #292929" }}>
                <div style={{ flex: 1, padding: "16px 20px", borderRight: "1px solid #292929" }}>
                  <input
                    type="tel"
                    placeholder="Phone number: (enter number)"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    style={inputBase}
                  />
                </div>
                <div style={{ flex: 1, padding: "16px 20px" }}>
                  <input
                    type="text"
                    placeholder="Location: (enter location)"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    style={inputBase}
                  />
                </div>
              </div>

              {/* Row 3: Message (full width, flex-grow) */}
              <div style={{ flex: 1, padding: "16px 20px", minHeight: "200px", display: "flex" }}>
                <textarea
                  placeholder="Write your message"
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  style={{ ...inputBase, flex: 1, minHeight: "180px" }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: "1px solid #292929",
                padding: "16px",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                {/* Cancel */}
                <button
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    background: "#262626",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 0",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "var(--font-geist-sans)",
                    fontWeight: 500,
                    color: "#fff",
                    lineHeight: "16px",
                  }}
                >
                  Cancel
                </button>
                {/* Send inquiry */}
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        flex: 1,
                        background: "#fff",
                        borderRadius: "8px",
                        padding: "8px 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontFamily: "var(--font-geist-sans)",
                        fontWeight: 500,
                        color: "#202020",
                        lineHeight: "16px",
                      }}
                    >
                      ✓ Sent!
                    </motion.div>
                  ) : (
                    <motion.button
                      key="send"
                      onClick={handleSend}
                      style={{
                        flex: 1,
                        background: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 0",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontFamily: "var(--font-geist-sans)",
                        fontWeight: 500,
                        color: "#202020",
                        lineHeight: "16px",
                      }}
                      whileHover={{ opacity: 0.9 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Send inquiry
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
