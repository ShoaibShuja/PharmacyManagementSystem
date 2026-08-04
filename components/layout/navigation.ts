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
  primary?: boolean;
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
    roles: ["admin", "pharmacist"],
  },
];

export function getNavigationItems(role: AppRole) {
  const availableItems = navigationItems.filter((item) =>
    item.roles.includes(role),
  );

  if (role !== "cashier") return availableItems;

  const cashierOrder = ["/sales", "/medicines", "/dashboard"];
  return availableItems
    .map((item) =>
      item.href === "/sales"
        ? { ...item, label: "New Sale", primary: true }
        : item,
    )
    .sort(
      (a, b) =>
        cashierOrder.indexOf(a.href) - cashierOrder.indexOf(b.href),
    );
}
