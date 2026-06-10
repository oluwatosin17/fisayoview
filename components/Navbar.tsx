"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { categories, type Category } from "@/lib/projects";

interface NavbarProps {
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  allMuted?: boolean;
}

const NAV_LINKS = [
  { label: "ABOUT",      href: "/about",                              external: false },
  { label: "CONTACT",    href: "/contact",                             external: false },
  { label: "INSTAGRAM",  href: "https://www.instagram.com/fisayoview/", external: true  },
];

export default function Navbar({
  activeCategory,
  onCategoryChange,
  allMuted = false,
}: NavbarProps) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { scrollY } = useScroll();

  // Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (latest > prev && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Opacity: if nothing hovered → 1; hovered item → 1; others → 0.3
  function itemOpacity(id: string) {
    if (hoveredId === null) return 1;
    return hoveredId === id ? 1 : 0.3;
  }

  const hoverProps = (id: string) => ({
    onMouseEnter: () => setHoveredId(id),
    onMouseLeave: () => setHoveredId(null),
    style: {
      opacity: itemOpacity(id),
      transition: "opacity 0.2s ease",
    } as React.CSSProperties,
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

  return (
    <motion.nav
      initial={false}
      animate={hidden ? "hidden" : "visible"}
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "#000",
        zIndex: 50,
      }}
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
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "24px",
          display: "flex",
          alignItems: "center",
          gap: "11px",
        }}
      >
        {categories.map((cat) => {
          const isActive = !allMuted && activeCategory === cat.value;
          const id = `cat-${cat.value}`;
          return (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
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
      <div
        style={{
          position: "absolute",
          right: "79px",
          top: "24px",
          display: "flex",
          alignItems: "center",
          gap: "11px",
        }}
      >
        {NAV_LINKS.map(({ label, href, external }) => {
          const id = `nav-${label}`;
          const isActivePage = !external && pathname === href;
          return (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              {...hoverProps(id)}
              style={{
                ...baseTextStyle,
                color: isActivePage ? "#fff" : "#808080",
                opacity: itemOpacity(id),
                transition: "opacity 0.2s ease",
              }}
            >
              {label}
            </a>
          );
        })}
      </div>
    </motion.nav>
  );
}
