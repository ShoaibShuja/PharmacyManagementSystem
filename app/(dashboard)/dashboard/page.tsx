import {
  AlertTriangle,
  CircleDollarSign,
  Package,
  PackageX,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A quick view of daily pharmacy operations."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today’s sales" value="$0.00" helper="No sales recorded" icon={CircleDollarSign} />
        <StatCard label="Medicines" value="0" helper="Catalog items" icon={Package} />
        <StatCard label="Low stock" value="0" helper="Needs attention" icon={PackageX} />
        <StatCard label="Expiring soon" value="0" helper="Next 30 days" icon={AlertTriangle} />
      </div>
      <EmptyState
        title="No activity yet"
        description="Dashboard activity will appear after medicines, stock, and sales are added."
      />
    </div>
  );
}
