"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { categories, type Category } from "@/lib/projects";

interface NavbarProps {
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  allMuted?: boolean;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", phone: "", location: "", message: "" };

export default function Navbar({
  activeCategory,
  onCategoryChange,
  allMuted = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 80) setHidden(true);
    else setHidden(false);
  });

  function itemOpacity(id: string) {
    if (hoveredId === null) return 1;
    return hoveredId === id ? 1 : 0.3;
  }

  const hoverProps = (id: string) => ({
    onMouseEnter: () => setHoveredId(id),
    onMouseLeave: () => setHoveredId(null),
    style: { opacity: itemOpacity(id), transition: "opacity 0.2s ease" } as React.CSSProperties,
  });

  const baseTextStyle: React.CSSProperties = {
    fontSize: "12px",
    fontFamily: "var(--font-geist-sans)",
    lineHeight: "normal",
    whiteSpace: "nowrap",
    letterSpacing: 0,
    textTransform: "uppercase",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textDecoration: "none",
  };

  function openContact() {
    setSent(false);
    setForm(EMPTY_FORM);
    setShowContact(true);
  }
  function closeContact() { setShowContact(false); }

  function handleSend() {
    const text = encodeURIComponent(
      `Hi Fisayo! 👋\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nLocation: ${form.location}\n\nMessage:\n${form.message}`
    );
    const subject = encodeURIComponent(`Inquiry from ${form.name || "a visitor"}`);
    const mailBody = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nLocation: ${form.location}\n\nMessage:\n${form.message}`
    );
    // Open both channels
    window.open(`https://wa.me/2348136404224?text=${text}`, "_blank");
    setTimeout(() => {
      window.open(`mailto:bookfisayoview@gmail.com?subject=${subject}&body=${mailBody}`, "_blank");
    }, 300);
    setSent(true);
    setTimeout(() => setShowContact(false), 1500);
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

  return (
    <>
      {/* ── Navbar bar ── */}
      <motion.nav
        initial={false}
        animate={hidden ? "hidden" : "visible"}
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, height: "64px", background: "#000", zIndex: 50 }}
      >
        {/* Logo */}
        <Link
          href="/"
          {...hoverProps("logo")}
          style={{
            ...baseTextStyle,
            position: "absolute",
            left: "60px",
            top: "24px",
            color: "#fff",
            opacity: itemOpacity("logo"),
            transition: "opacity 0.2s ease",
          }}
        >
          FISAYOVIEW
        </Link>

        {/* Category filters — centered */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "24px", display: "flex", alignItems: "center", gap: "11px" }}>
          {categories.map((cat) => {
            const isActive = !allMuted && activeCategory === cat.value;
            const id = `cat-${cat.value}`;
            const handleClick = () => {
              if (pathname !== "/") {
                sessionStorage.setItem("fisayoview_category", cat.value);
                sessionStorage.removeItem("fisayoview_scrollY");
                sessionStorage.removeItem("fisayoview_visibleCount");
                router.push("/");
              } else {
                onCategoryChange(cat.value);
              }
            };
            return (
              <button
                key={cat.value}
                onClick={handleClick}
                {...hoverProps(id)}
                style={{
                  ...baseTextStyle,
                  color: isActive ? "#fff" : "#808080",
                  opacity: itemOpacity(id),
                  transition: "opacity 0.2s ease, color 0.15s ease",
                }}
              >
                {cat.label} ({cat.count})
              </button>
            );
          })}
        </div>

        {/* Nav links — right */}
        <div style={{ position: "absolute", right: "79px", top: "24px", display: "flex", alignItems: "center", gap: "11px" }}>
          {/* ABOUT */}
          <Link
            href="/about"
            {...hoverProps("nav-ABOUT")}
            style={{
              ...baseTextStyle,
              color: pathname === "/about" ? "#fff" : "#808080",
              opacity: itemOpacity("nav-ABOUT"),
              transition: "opacity 0.2s ease",
            }}
          >
            ABOUT
          </Link>

          {/* CONTACT — opens modal in place, no navigation */}
          <button
            onClick={openContact}
            {...hoverProps("nav-CONTACT")}
            style={{
              ...baseTextStyle,
              color: showContact ? "#fff" : "#808080",
              opacity: itemOpacity("nav-CONTACT"),
              transition: "opacity 0.2s ease",
            }}
          >
            CONTACT
          </button>

          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/fisayoview/"
            target="_blank"
            rel="noopener noreferrer"
            {...hoverProps("nav-INSTAGRAM")}
            style={{
              ...baseTextStyle,
              color: "#808080",
              opacity: itemOpacity("nav-INSTAGRAM"),
              transition: "opacity 0.2s ease",
            }}
          >
            INSTAGRAM
          </a>
        </div>
      </motion.nav>

      {/* ── Contact modal overlay — renders over any page ── */}
      <AnimatePresence>
        {showContact && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeContact}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 200,
              }}
            />

            {/* Centering shell — flex keeps the modal perfectly centred
                regardless of Framer Motion's own scale/y transforms */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 201,
                pointerEvents: "none", // backdrop handles clicks; modal re-enables
              }}
            >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                width: "500px",
                height: "620px",
                background: "#202020",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                pointerEvents: "auto",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #292929", flexShrink: 0 }}>
                <span style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 400, color: "#fff", lineHeight: "normal", whiteSpace: "nowrap" }}>
                  Contact
                </span>
                <button
                  onClick={closeContact}
                  aria-label="Close"
                  style={{ width: "16px", height: "16px", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#333" />
                    <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Row 1: Name | Email */}
                <div style={{ display: "flex", borderBottom: "1px solid #292929" }}>
                  <div style={{ flex: 1, padding: "16px 20px", borderRight: "1px solid #292929" }}>
                    <input
                      type="text"
                      placeholder="Name: (enter full name)"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      style={inputBase}
                    />
                  </div>
                  <div style={{ flex: 1, padding: "16px 20px" }}>
                    <input
                      type="email"
                      placeholder="From: (enter your email address)"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      style={inputBase}
                    />
                  </div>
                  <div style={{ flex: 1, padding: "16px 20px" }}>
                    <input
                      type="text"
                      placeholder="Location: (enter location)"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      style={inputBase}
                    />
                  </div>
                </div>

                {/* Row 3: Message — fills remaining height */}
                <div style={{ flex: "1 1 0", padding: "16px 20px", minHeight: "200px", display: "flex" }}>
                  <textarea
                    placeholder="Write your message"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    style={{ ...inputBase, flex: 1, minHeight: "180px", resize: "none" }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ borderTop: "1px solid #292929", padding: "16px", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={closeContact}
                    style={{ flex: 1, background: "#262626", border: "none", borderRadius: "8px", padding: "8px 0", cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "#fff", lineHeight: "16px" }}
                  >
                    Cancel
                  </button>
                  <AnimatePresence mode="wait">
                    {sent ? (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ flex: 1, background: "#fff", borderRadius: "8px", padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "#202020", lineHeight: "16px" }}
                      >
                        ✓ Sent!
                      </motion.div>
                    ) : (
                      <motion.button
                        key="send"
                        onClick={handleSend}
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ flex: 1, background: "#fff", border: "none", borderRadius: "8px", padding: "8px 0", cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "#202020", lineHeight: "16px" }}
                      >
                        Send inquiry
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Placeholder styles for inputs */}
      <style>{`input::placeholder,textarea::placeholder{color:#888}`}</style>
    </>
  );
}
