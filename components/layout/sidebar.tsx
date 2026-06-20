"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";
import { getNavigationItems } from "@/components/layout/navigation";
import type { AppRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const navigationItems = getNavigationItems(role);

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <BrandMark className="size-9" priority />
        <div>
          <p className="text-sm font-semibold">Darman</p>
          <p className="text-xs text-muted-foreground">Pharmacy Management</p>
        </div>
      </div>
      <nav className="space-y-1 p-4" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-accent text-accent-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
