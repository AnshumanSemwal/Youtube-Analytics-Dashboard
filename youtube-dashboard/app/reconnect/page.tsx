"use client";

import { signIn } from "next-auth/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:  "Reconnect Account",
  robots: { index: false },
};

export default function ReconnectPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Reconnect your account</h1>
        <p className="text-gray-500 mb-8">
          Your Google account access has expired or been revoked. 
          Sign in again to reconnect your YouTube channel.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
        >
          Sign in with Google again
        </button>
      </div>
    </main>
  );
}