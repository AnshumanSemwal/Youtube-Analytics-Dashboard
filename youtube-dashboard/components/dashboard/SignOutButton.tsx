"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 dark:border-gray-700 text-foreground transition-colors"
    >
      Sign out
    </button>
  );
}