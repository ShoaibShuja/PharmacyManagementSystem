"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { getNavigationItems } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

export function MobileNavigation({ role }: { role: AppRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navigationItems = getNavigationItems(role);

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="lg:hidden"
        aria-label="Open navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-5" />
      </Button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative h-full w-72 bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <div className="flex items-center gap-3">
                <BrandMark className="size-9" priority />
                <span className="font-semibold">Darman</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Close navigation"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="space-y-1 p-4">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
