import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavigationRestorer from "./NavigationRestorer";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FISAYOVIEW",
  description: "Photography portfolio by Fisayo",
  icons: {
    icon: [
      { url: "/logo-black.png", media: "(prefers-color-scheme: light)" },
      { url: "/logo-white.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/logo-black.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="bg-black text-white min-h-screen">
        <NavigationRestorer />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
