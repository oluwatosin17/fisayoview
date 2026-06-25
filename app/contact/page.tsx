import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BASE_URL } from "@/app/layout";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book Fisayo Obalana (FISAYOVIEW) for a photoshoot in Lagos, Nigeria. Reach out via WhatsApp, email, or the contact form to discuss your birthday, wedding, graduation, or portrait session.",
  openGraph: {
    title: "Contact FISAYOVIEW — Book a Photoshoot in Lagos",
    description:
      "Get in touch with Fisayo Obalana to book a birthday, wedding, graduation, or portrait session in Lagos, Nigeria.",
    url: `${BASE_URL}/contact`,
  },
  alternates: { canonical: `${BASE_URL}/contact` },
  robots: { index: false }, // redirects to home; avoid indexing the redirect page
};

// Contact is now a modal triggered from the navbar on any page.
export default function ContactPage() {
  redirect("/");
}
