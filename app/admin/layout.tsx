import { ToastProvider } from "@/components/admin/Toast";

export const metadata = {
  title: "Admin — Fisayoview",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
