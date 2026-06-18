"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesTrendPoint } from "@/lib/dashboard/types";

export function SalesTrendChart({
  data,
  currencyCode,
}: {
  data: SalesTrendPoint[];
  currencyCode: string;
}) {
  return (
    <div className="h-64 w-full" aria-label="Seven day sales trend chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18 }}>
          <defs>
            <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            fontSize={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tickFormatter={(value: number) => `${value}`}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              borderRadius: "0.625rem",
              border: "1px solid var(--border)",
              background: "var(--card)",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              fontSize: "0.75rem",
            }}
            formatter={(value) => [
              `${currencyCode} ${Number(value).toFixed(2)}`,
              "Sales",
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#sales-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
