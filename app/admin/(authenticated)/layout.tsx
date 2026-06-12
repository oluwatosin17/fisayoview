import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AuthenticatedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
