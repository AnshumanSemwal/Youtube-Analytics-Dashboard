"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger,SheetTitle,SheetDescription,} from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  children:         React.ReactNode;
  channelTitle:     string;
  channelThumbnail: string | null;
  userImage:        string | null;
  userName:         string | null;
}

export default function DashboardShell({
  children,
  channelTitle,
  channelThumbnail,
  userImage,
  userName,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">

      {/* Top header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 sticky top-0 bg-white dark:bg-gray-950 z-10">

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-950">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SheetDescription className="sr-only">Main navigation links</SheetDescription>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <p className="font-semibold text-sm dark:text-white">{channelTitle}</p>
            </div>
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Channel thumbnail + name */}
        {channelThumbnail && (
          <Image
            src={channelThumbnail}
            alt={channelTitle}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <span className="font-semibold text-sm hidden md:block dark:text-white">
          {channelTitle}
        </span>

        <div className="flex-1" />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User avatar */}
        {userImage && (
          <Image
            src={userImage}
            alt={userName || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
      </header>

      {/* Body */}
      <div className="flex flex-1">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r border-gray-200 dark:border-gray-800 shrink-0">
          <Sidebar />
        </aside>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
}