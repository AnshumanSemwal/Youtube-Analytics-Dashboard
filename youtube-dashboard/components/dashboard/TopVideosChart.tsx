"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Props {
  data: { title: string; views: number }[];
}

export default function TopVideosChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No videos found. Click Refresh to sync.
      </div>
    );
  }

  // Truncate long titles for the axis
  const formatted = data.map((v) => ({
    ...v,
    shortTitle: v.title.length > 38 ? v.title.slice(0, 35) + "..." : v.title,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 36)}>
      <BarChart
        data={formatted}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#888" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
        />
        <YAxis
          type="category"
          dataKey="shortTitle"
          tick={{ fontSize: 10, fill: "#555" }}
          tickLine={false}
          axisLine={false}
          width={180}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eee" }}
          formatter={(value) => [
            value != null ? Number(value).toLocaleString() : "0",
            "Views",
          ]}
          labelFormatter={(label) => {
            const match = formatted.find((v) => v.shortTitle === label);
            return match?.title || label;
          }}
        />
        {formatted.map((_, i) => (
          <Cell key={i} fill={i === 0 ? "#111111" : "#E5E4DF"} />
        ))}
        <Bar dataKey="views" radius={[0, 4, 4, 0]}>
          {formatted.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#111111" : "#E5E4DF"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}