"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ChannelData = {
  id: string;
  channelId: string;
  title: string;
  handle: string | null;
  thumbnailUrl: string | null;
};

type PageState = "idle" | "loading" | "success" | "error";

export default function ConnectChannelPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("idle");
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [error, setError] = useState<string>("");

  async function handleConnect() {
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/connect-channel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      setChannel(data.channel);
      setState("success");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  // Confirmation screen after successful connection
  if (state === "success" && channel) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          {channel.thumbnailUrl && (
            <Image
              src={channel.thumbnailUrl}
              alt={channel.title}
              width={80}
              height={80}
              className="rounded-full mx-auto mb-4"
            />
          )}
          <p className="text-green-600 font-semibold mb-1">Channel connected</p>
          <h1 className="text-2xl font-bold mb-1">{channel.title}</h1>
          {channel.handle && (
            <p className="text-gray-500 mb-6">{channel.handle}</p>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // Connect screen
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Connect your YouTube channel</h1>
        <p className="text-gray-500 mb-8">
          We will fetch your channel data using your Google account.
          No passwords required.
        </p>

        {state === "error" && (
          <p className="text-red-500 mb-4 text-sm">{error}</p>
        )}

        <button
          onClick={handleConnect}
          disabled={state === "loading"}
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "loading" ? "Connecting..." : "Connect YouTube Channel"}
        </button>
      </div>
    </main>
  );
}