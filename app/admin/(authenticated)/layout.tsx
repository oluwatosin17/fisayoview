import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AuthenticatedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen" style={{ background: "#080808", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
