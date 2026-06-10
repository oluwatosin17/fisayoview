"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { categories, type Category } from "@/lib/projects";
import { useBreakpoint } from "@/hooks/useBreakpoint";

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

/** Total navbar height per breakpoint — exported for consumers */
export const NAV_HEIGHT = { mobile: "96px", tablet: "64px", desktop: "64px" } as const;

export default function Navbar({
  activeCategory,
  onCategoryChange,
  allMuted = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
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

  function openContact() { setSent(false); setForm(EMPTY_FORM); setShowContact(true); }
  function closeContact() { setShowContact(false); }

  function handleSend() {
    const text = encodeURIComponent(
      `Hi Fisayo! 👋\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nLocation: ${form.location}\n\nMessage:\n${form.message}`
    );
    const subject = encodeURIComponent(`Inquiry from ${form.name || "a visitor"}`);
    const mailBody = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nLocation: ${form.location}\n\nMessage:\n${form.message}`
    );
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

  /* ── Shared category click handler ── */
  function handleCatClick(value: string) {
    if (pathname !== "/") {
      sessionStorage.setItem("fisayoview_category", value);
      sessionStorage.removeItem("fisayoview_scrollY");
      sessionStorage.removeItem("fisayoview_visibleCount");
      router.push("/");
    } else {
      onCategoryChange(value as Category);
    }
  }

  /* ── Shared footer buttons (used in both desktop + mobile contact) ── */
  function ContactFooter() {
    return (
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
              <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ flex: 1, background: "#fff", borderRadius: "8px", padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "#202020", lineHeight: "16px" }}>
                ✓ Sent!
              </motion.div>
            ) : (
              <motion.button key="send" onClick={handleSend} whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.98 }}
                style={{ flex: 1, background: "#fff", border: "none", borderRadius: "8px", padding: "8px 0", cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "#202020", lineHeight: "16px" }}>
                Send inquiry
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Navbar ── */}
      <motion.nav
        initial={false}
        animate={hidden ? "hidden" : "visible"}
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: isMobile ? NAV_HEIGHT.mobile : NAV_HEIGHT.desktop,
          background: "#000",
          zIndex: 50,
        }}
      >
        {/* ── Desktop / Tablet ── */}
        {!isMobile && (
          <>
            <Link href="/" {...hoverProps("logo")} style={{ ...baseTextStyle, fontSize: "12px", position: "absolute", left: "60px", top: "24px", color: "#fff", opacity: itemOpacity("logo"), transition: "opacity 0.2s ease" }}>
              FISAYOVIEW
            </Link>

            <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "24px", display: "flex", alignItems: "center", gap: "11px" }}>
              {categories.map((cat) => {
                const isActive = !allMuted && activeCategory === cat.value;
                const id = `cat-${cat.value}`;
                return (
                  <button key={cat.value} onClick={() => handleCatClick(cat.value)} {...hoverProps(id)}
                    style={{ ...baseTextStyle, fontSize: "12px", color: isActive ? "#fff" : "#808080", opacity: itemOpacity(id), transition: "opacity 0.2s ease, color 0.15s ease" }}>
                    {cat.label} ({cat.count})
                  </button>
                );
              })}
            </div>

            <div style={{ position: "absolute", right: "60px", top: "24px", display: "flex", alignItems: "center", gap: "11px" }}>
              <Link href="/about" {...hoverProps("nav-ABOUT")} style={{ ...baseTextStyle, fontSize: "12px", color: pathname === "/about" ? "#fff" : "#808080", opacity: itemOpacity("nav-ABOUT"), transition: "opacity 0.2s ease" }}>ABOUT</Link>
              <button onClick={openContact} {...hoverProps("nav-CONTACT")} style={{ ...baseTextStyle, fontSize: "12px", color: showContact ? "#fff" : "#808080", opacity: itemOpacity("nav-CONTACT"), transition: "opacity 0.2s ease" }}>CONTACT</button>
              <a href="https://www.instagram.com/fisayoview/" target="_blank" rel="noopener noreferrer" {...hoverProps("nav-INSTAGRAM")} style={{ ...baseTextStyle, fontSize: "12px", color: "#808080", opacity: itemOpacity("nav-INSTAGRAM"), transition: "opacity 0.2s ease" }}>INSTAGRAM</a>
            </div>
          </>
        )}

        {/* ── Mobile: matches Figma node 541:952 ── */}
        {isMobile && (
          <>
            {/* Top bar — logo left, links right, 45px height */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "45px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px",
              borderBottom: "1px solid #1a1a1a",
            }}>
              <Link href="/" style={{ ...baseTextStyle, fontSize: "10px", color: "#fff" }}>FISAYOVIEW</Link>
              <div style={{ display: "flex", gap: "11px", alignItems: "center" }}>
                <Link href="/about" style={{ ...baseTextStyle, fontSize: "10px", color: pathname === "/about" ? "#fff" : "#808080" }}>ABOUT</Link>
                <button onClick={openContact} style={{ ...baseTextStyle, fontSize: "10px", color: showContact ? "#fff" : "#808080" }}>CONTACT</button>
                <a href="https://www.instagram.com/fisayoview/" target="_blank" rel="noopener noreferrer" style={{ ...baseTextStyle, fontSize: "10px", color: "#808080" }}>INSTAGRAM</a>
              </div>
            </div>

            {/* Category strip — at y:64, gap:20px, left-padding:16px, horizontal scroll */}
            <div style={{
              position: "absolute", top: "64px", left: 0, right: 0,
              display: "flex", alignItems: "center",
              paddingLeft: "16px", gap: "20px",
              overflowX: "auto", scrollbarWidth: "none",
            }}>
              {categories.map((cat) => {
                const isActive = !allMuted && activeCategory === cat.value;
                return (
                  <button key={cat.value} onClick={() => handleCatClick(cat.value)}
                    style={{ ...baseTextStyle, fontSize: "12px", color: isActive ? "#fff" : "#808080", flexShrink: 0, transition: "color 0.15s ease" }}>
                    {cat.label} ({cat.count})
                  </button>
                );
              })}
            </div>
          </>
        )}
      </motion.nav>

      {/* ── Contact overlay ── */}
      <AnimatePresence>
        {showContact && (
          <>
            {/* Backdrop */}
            <motion.div key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeContact}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200 }}
            />

            {isMobile ? (
              /* ── Mobile: full-screen bottom sheet (Figma node 541:1017) ── */
              <motion.div
                key="modal-mobile"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  position: "fixed",
                  top: "45px", /* sits below the navbar top bar */
                  left: 0, right: 0, bottom: 0,
                  background: "#202020",
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                  zIndex: 201,
                }}
              >
                {/* Stacked fields */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {[
                    { placeholder: "Name: (enter full name)", key: "name", type: "text" },
                    { placeholder: "From: (enter your email address)", key: "email", type: "email" },
                    { placeholder: "Phone number: (enter number)", key: "phone", type: "tel" },
                    { placeholder: "Location: (enter location)", key: "location", type: "text" },
                  ].map((field) => (
                    <div key={field.key} style={{ padding: "16px", borderBottom: "1px solid #292929", height: "48px", display: "flex", alignItems: "center" }}>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof FormState]}
                        onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                        style={inputBase}
                      />
                    </div>
                  ))}
                  {/* Message — fills remaining space */}
                  <div style={{ flex: "1 1 0", padding: "16px", minHeight: "120px", display: "flex" }}>
                    <textarea
                      placeholder="Write your message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      style={{ ...inputBase, flex: 1, resize: "none", minHeight: "100px" }}
                    />
                  </div>
                </div>
                <ContactFooter />
              </motion.div>
            ) : (
              /* ── Desktop: centered dialog ── */
              <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 201, pointerEvents: "none" }}>
                <motion.div
                  key="modal-desktop"
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ width: "500px", height: "620px", background: "#202020", borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden", pointerEvents: "auto" }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #292929", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 400, color: "#fff" }}>Contact</span>
                    <button onClick={closeContact} aria-label="Close" style={{ width: "16px", height: "16px", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#333" />
                        <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {/* Body */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #292929" }}>
                      <div style={{ flex: 1, padding: "16px 20px", borderRight: "1px solid #292929" }}>
                        <input type="text" placeholder="Name: (enter full name)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputBase} />
                      </div>
                      <div style={{ flex: 1, padding: "16px 20px" }}>
                        <input type="email" placeholder="From: (enter your email address)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputBase} />
                      </div>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #292929" }}>
                      <div style={{ flex: 1, padding: "16px 20px", borderRight: "1px solid #292929" }}>
                        <input type="tel" placeholder="Phone number: (enter number)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputBase} />
                      </div>
                      <div style={{ flex: 1, padding: "16px 20px" }}>
                        <input type="text" placeholder="Location: (enter location)" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} style={inputBase} />
                      </div>
                    </div>
                    <div style={{ flex: "1 1 0", padding: "16px 20px", minHeight: "200px", display: "flex" }}>
                      <textarea placeholder="Write your message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} style={{ ...inputBase, flex: 1, minHeight: "180px", resize: "none" }} />
                    </div>
                  </div>
                  <ContactFooter />
                </motion.div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>

      <style>{`input::placeholder,textarea::placeholder{color:#888}::-webkit-scrollbar{display:none}`}</style>
    </>
  );
}
