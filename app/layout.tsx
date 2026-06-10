import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavigationRestorer from "./NavigationRestorer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FISAYOVIEW",
  description: "Photography portfolio by Fisayo",
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
        {children}
      </body>
    </html>
  );
}
