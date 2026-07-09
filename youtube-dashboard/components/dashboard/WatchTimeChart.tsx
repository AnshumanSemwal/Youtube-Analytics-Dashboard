"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; watchTime: number }[];
}

export default function WatchTimeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No data for this period. Click Refresh to sync.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="watchGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1A5C3A" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1A5C3A" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#888" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#888" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}h`}
          width={40}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eee" }}
          formatter={(value) => [
            value != null ? `${value}h` : "0h",
            "Watch Time",
          ]}
        />
        <Area
          type="monotone"
          dataKey="watchTime"
          stroke="#1A5C3A"
          strokeWidth={2}
          fill="url(#watchGrad)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}