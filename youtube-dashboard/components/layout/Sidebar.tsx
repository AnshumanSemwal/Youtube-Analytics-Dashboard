"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, BarChart2, Settings } from "lucide-react";

const links = [
  { href: "/dashboard",           label: "Overview",  icon: LayoutDashboard },
  { href: "/dashboard/videos",    label: "Videos",    icon: Video           },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2       },
  { href: "/dashboard/settings",  label: "Settings",  icon: Settings        },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      {links.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${active
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}