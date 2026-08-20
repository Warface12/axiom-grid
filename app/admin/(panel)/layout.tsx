import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isAdminUser();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}