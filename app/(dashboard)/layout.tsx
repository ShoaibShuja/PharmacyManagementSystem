import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireAuth } from "@/lib/auth/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, email } = await requireAuth();

  return (
    <div className="min-h-screen">
      <Sidebar profile={profile} email={email} />
      <div className="lg:pl-64">
        <AppHeader profile={profile} email={email} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
