import {
  ChartNoAxesCombined,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/types";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: readonly AppRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "pharmacist", "cashier"],
  },
  {
    label: "Medicines",
    href: "/medicines",
    icon: Package,
    roles: ["admin", "pharmacist", "cashier"],
  },
  {
    label: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin", "pharmacist", "cashier"],
  },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    roles: ["admin", "pharmacist"],
  },
  {
    label: "Purchases",
    href: "/purchases",
    icon: ReceiptText,
    roles: ["admin", "pharmacist"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: ChartNoAxesCombined,
    roles: ["admin", "pharmacist"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export function getNavigationItems(role: AppRole) {
  return navigationItems.filter((item) => item.roles.includes(role));
}
