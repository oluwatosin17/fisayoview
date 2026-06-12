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

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", phone: "", location: "", message: "" };

export const NAV_HEIGHT = { mobile: "96px", tablet: "64px", desktop: "64px" } as const;

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Please enter your full name (min 2 characters)";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Please enter a valid email address";
  if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 7) errors.phone = "Please enter a valid phone number";
  if (!form.message.trim() || form.message.trim().length < 10) errors.message = "Message must be at least 10 characters";
  return errors;
}

export default function Navbar({ activeCategory, onCategoryChange, allMuted = false }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [hidden, setHidden] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [sending, setSending] = useState(false);
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

  function openContact() { setSent(false); setForm(EMPTY_FORM); setErrors({}); setTouched({}); setShowContact(true); }
  function closeContact() { setShowContact(false); }

  function touch(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }));
    const e = validateForm(form);
    setErrors(e);
  }

  function setField(field: keyof FormState, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      setErrors(validateForm(updated));
    }
  }

  async function handleSend() {
    const allTouched = { name: true, email: true, phone: true, message: true } as const;
    setTouched(allTouched);
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event_type: form.location }),
      });
    } catch {
      // best-effort — still proceed to WhatsApp
    }
    setSending(false);

    const text = encodeURIComponent(
      `Hi Fisayo! 👋\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nLocation: ${form.location}\n\nMessage:\n${form.message}`
    );
    window.open(`https://wa.me/2348136404224?text=${text}`, "_blank");
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

  const isFormValid = Object.keys(validateForm(form)).length === 0;

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

  function FieldError({ field }: { field: keyof FormErrors }) {
    if (!touched[field as keyof FormState] || !errors[field]) return null;
    return <p style={{ fontSize: "10px", color: "#f87171", margin: "3px 0 0", fontFamily: "var(--font-geist-sans)" }}>{errors[field]}</p>;
  }

  function ContactFooter() {
    return (
      <div style={{ borderTop: "1px solid #292929", padding: "16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={closeContact}
            style={{ flex: 1, background: "#262626", border: "none", borderRadius: "8px", padding: "10px 0", cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "#fff" }}>
            Cancel
          </button>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ flex: 1, background: "#fff", borderRadius: "8px", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "#202020" }}>
                ✓ Sent!
              </motion.div>
            ) : (
              <motion.button key="send" onClick={handleSend} disabled={sending}
                whileHover={{ opacity: isFormValid ? 0.9 : 1 }} whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                style={{ flex: 1, background: isFormValid ? "#fff" : "#333", border: "none", borderRadius: "8px", padding: "10px 0", cursor: isFormValid ? "pointer" : "not-allowed", fontSize: "12px", fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: isFormValid ? "#202020" : "#666" }}>
                {sending ? "Sending…" : "Send inquiry"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.nav
        initial={false}
        animate={hidden ? "hidden" : "visible"}
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, height: isMobile ? NAV_HEIGHT.mobile : NAV_HEIGHT.desktop, background: "#000", zIndex: 50 }}
      >
        {!isMobile && (
          <>
            <Link href="/" {...hoverProps("logo")} style={{ ...baseTextStyle, fontSize: "12px", position: "absolute", left: "60px", top: "50%", transform: "translateY(-50%)", color: "#fff", opacity: itemOpacity("logo"), transition: "opacity 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "14px", height: "14px", background: "#fff", borderRadius: "0.84px", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-black.png" alt="FV" style={{ width: "10px", height: "10px", objectFit: "contain", display: "block" }} />
              </span>
              FISAYOVIEW
            </Link>
            <div style={{ position: "absolute", left: "50%", transform: "translate(-50%, -50%)", top: "50%", display: "flex", alignItems: "center", gap: "11px" }}>
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
            <div style={{ position: "absolute", right: "60px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "11px" }}>
              <Link href="/about" {...hoverProps("nav-ABOUT")} style={{ ...baseTextStyle, fontSize: "12px", color: pathname === "/about" ? "#fff" : "#808080", opacity: itemOpacity("nav-ABOUT"), transition: "opacity 0.2s ease" }}>ABOUT</Link>
              <button onClick={openContact} {...hoverProps("nav-CONTACT")} style={{ ...baseTextStyle, fontSize: "12px", color: showContact ? "#fff" : "#808080", opacity: itemOpacity("nav-CONTACT"), transition: "opacity 0.2s ease" }}>CONTACT</button>
              <a href="https://www.instagram.com/fisayoview/" target="_blank" rel="noopener noreferrer" {...hoverProps("nav-INSTAGRAM")} style={{ ...baseTextStyle, fontSize: "12px", color: "#808080", opacity: itemOpacity("nav-INSTAGRAM"), transition: "opacity 0.2s ease" }}>INSTAGRAM</a>
            </div>
          </>
        )}
        {isMobile && (
          <>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #1a1a1a" }}>
              <Link href="/" style={{ ...baseTextStyle, fontSize: "11px", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "14px", height: "14px", background: "#fff", borderRadius: "0.84px", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-black.png" alt="FV" style={{ width: "10px", height: "10px", objectFit: "contain", display: "block" }} />
                </span>
                FISAYOVIEW
              </Link>
              <div style={{ display: "flex", gap: "11px", alignItems: "center" }}>
                <Link href="/about" style={{ ...baseTextStyle, fontSize: "11px", color: pathname === "/about" ? "#fff" : "#808080" }}>ABOUT</Link>
                <button onClick={openContact} style={{ ...baseTextStyle, fontSize: "11px", color: showContact ? "#fff" : "#808080" }}>CONTACT</button>
                <a href="https://www.instagram.com/fisayoview/" target="_blank" rel="noopener noreferrer" style={{ ...baseTextStyle, fontSize: "11px", color: "#808080" }}>INSTAGRAM</a>
              </div>
            </div>
            <div style={{ position: "absolute", top: "64px", left: 0, right: 0, display: "flex", alignItems: "center", paddingLeft: "16px", gap: "22px", overflowX: "auto", scrollbarWidth: "none" }}>
              {categories.map((cat) => {
                const isActive = !allMuted && activeCategory === cat.value;
                return (
                  <button key={cat.value} onClick={() => handleCatClick(cat.value)}
                    style={{ ...baseTextStyle, fontSize: "11px", color: isActive ? "#fff" : "#808080", flexShrink: 0, transition: "color 0.15s ease" }}>
                    {cat.label} ({cat.count})
                  </button>
                );
              })}
            </div>
          </>
        )}
      </motion.nav>

      {/* Contact overlay */}
      <AnimatePresence>
        {showContact && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={closeContact}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200 }} />

            {isMobile ? (
              <motion.div key="modal-mobile" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ position: "fixed", top: "45px", left: 0, right: 0, bottom: 0, background: "#202020", display: "flex", flexDirection: "column", overflowY: "auto", zIndex: 201 }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {([
                    { placeholder: "Name: (enter full name)", field: "name", type: "text", validated: true },
                    { placeholder: "From: (enter your email address)", field: "email", type: "email", validated: true },
                    { placeholder: "Phone number: (enter number)", field: "phone", type: "tel", validated: true },
                    { placeholder: "Location: (enter location)", field: "location", type: "text", validated: false },
                  ] as const).map((f) => (
                    <div key={f.field} style={{ padding: "12px 16px", borderBottom: "1px solid #292929" }}>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.field]}
                        onChange={(e) => setField(f.field, e.target.value)}
                        onBlur={() => touch(f.field)}
                        style={inputBase} />
                      {f.validated && <FieldError field={f.field as keyof FormErrors} />}
                    </div>
                  ))}
                  <div style={{ flex: "1 1 0", padding: "12px 16px", minHeight: "120px", display: "flex", flexDirection: "column" }}>
                    <textarea placeholder="Write your message" value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      onBlur={() => touch("message")}
                      style={{ ...inputBase, flex: 1, resize: "none", minHeight: "100px" }} />
                    <FieldError field="message" />
                  </div>
                </div>
                <ContactFooter />
              </motion.div>
            ) : (
              <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 201, pointerEvents: "none" }}>
                <motion.div key="modal-desktop" initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ width: "500px", maxHeight: "90vh", background: "#202020", borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden", pointerEvents: "auto" }}>
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
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #292929" }}>
                      <div style={{ flex: 1, padding: "12px 20px", borderRight: "1px solid #292929" }}>
                        <input type="text" placeholder="Name: (enter full name)" value={form.name}
                          onChange={(e) => setField("name", e.target.value)} onBlur={() => touch("name")} style={inputBase} />
                        <FieldError field="name" />
                      </div>
                      <div style={{ flex: 1, padding: "12px 20px" }}>
                        <input type="email" placeholder="From: (enter your email)" value={form.email}
                          onChange={(e) => setField("email", e.target.value)} onBlur={() => touch("email")} style={inputBase} />
                        <FieldError field="email" />
                      </div>
                    </div>
                    <div style={{ display: "flex", borderBottom: "1px solid #292929" }}>
                      <div style={{ flex: 1, padding: "12px 20px", borderRight: "1px solid #292929" }}>
                        <input type="tel" placeholder="Phone number" value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)} onBlur={() => touch("phone")} style={inputBase} />
                        <FieldError field="phone" />
                      </div>
                      <div style={{ flex: 1, padding: "12px 20px" }}>
                        <input type="text" placeholder="Location: (enter location)" value={form.location}
                          onChange={(e) => setField("location", e.target.value)} style={inputBase} />
                      </div>
                    </div>
                    <div style={{ flex: "1 1 0", padding: "12px 20px", minHeight: "180px", display: "flex", flexDirection: "column" }}>
                      <textarea placeholder="Write your message" value={form.message}
                        onChange={(e) => setField("message", e.target.value)} onBlur={() => touch("message")}
                        style={{ ...inputBase, flex: 1, minHeight: "160px", resize: "none" }} />
                      <FieldError field="message" />
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
