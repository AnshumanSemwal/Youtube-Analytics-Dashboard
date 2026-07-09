"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger,SheetTitle,SheetDescription, } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";

interface Props {
  children: React.ReactNode;
  channelTitle: string;
  channelThumbnail: string | null;
  userImage: string | null;
  userName: string | null;
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
    <div className="min-h-screen flex flex-col">

      {/* Top header */}
      <header className="h-14 border-b flex items-center px-4 gap-3 sticky top-0 bg-white z-10">

        {/* Mobile menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SheetDescription className="sr-only">
                Dashboard navigation links
            </SheetDescription>
            <div className="p-4 border-b">
              <p className="font-semibold text-sm">{channelTitle}</p>
            </div>
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Channel info */}
        {channelThumbnail && (
          <Image
            src={channelThumbnail}
            alt={channelTitle}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <span className="font-semibold text-sm hidden md:block">{channelTitle}</span>

        {/* Spacer */}
        <div className="flex-1" />

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
        <aside className="hidden md:flex w-56 flex-col border-r shrink-0">
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