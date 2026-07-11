import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart2, Shield, Filter } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

export const metadata: Metadata = {
  title:       "YouTube Analytics for Creators",
  description: SITE_DESCRIPTION,
  alternates:  { canonical: SITE_URL },
  openGraph: {
    title:       `${SITE_NAME} — YouTube Analytics for Creators`,
    description: SITE_DESCRIPTION,
    url:         SITE_URL,
  },
};

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <nav className="border-b dark:border-gray-800 px-6 h-14 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-10">
        <span className="font-bold text-sm tracking-tight">
          YT Analytics
        </span>
        <ThemeToggle />
        <Link
          href="/login"
          className="text-sm px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
          YouTube analytics that go<br className="hidden md:block" /> deeper than Studio.
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
          Connect your channel with one click. See your real views, watch time,
          and video performance — all in one clean dashboard.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Sign in with Google — it&apos;s free
        </Link>
        <div className="mt-3 flex items-center justify-center gap-4">
          <Link
            href="/demo"
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white underline underline-offset-4 transition-colors"
          >
            View live demo
          </Link>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <p className="text-xs text-gray-400">No credit card. Read-only access.</p>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          No credit card. Read-only access to your channel.
        </p>

        {/* Dashboard preview mock */}
        <div className="mt-14 hidden md:block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-200 dark:shadow-none text-left">

          {/* Browser chrome */}
          <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-3 bg-white dark:bg-gray-800 rounded-md h-5 flex items-center px-3">
              <span className="text-gray-400 text-xs">
                yt-analytics.vercel.app/dashboard
              </span>
            </div>
          </div>

          {/* App shell */}
          <div className="flex bg-white dark:bg-gray-950" style={{ height: "340px" }}>

            {/* Sidebar */}
            <div className="w-44 bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-3 shrink-0">
              <div className="flex items-center gap-2 mb-5 px-2">
                <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
              {[
                { label: "Overview", active: true },
                { label: "Videos",   active: false },
                { label: "Analytics",active: false },
                { label: "Settings", active: false },
              ].map(({ label, active }) => (
                <div
                  key={label}
                  className={`h-8 rounded-lg mb-1 flex items-center px-3 ${
                    active
                      ? "bg-black dark:bg-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      active
                        ? "text-white dark:text-black"
                        : "text-gray-500 dark:text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 overflow-hidden">

              {/* Controls bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                <div className="flex gap-1">
                  {["7d", "28d", "90d"].map((label) => (
                    <div
                      key={label}
                      className={`h-6 px-3 rounded text-xs flex items-center ${
                        label === "28d"
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Views",       value: "284K"  },
                  { label: "Subscribers", value: "12.4K" },
                  { label: "Watch Time",  value: "1,842h"},
                  { label: "Videos",      value: "87"    },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="border border-gray-100 dark:border-gray-800 rounded-xl p-3"
                  >
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Line chart sim */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-3">Daily Views</p>
                  <svg viewBox="0 0 200 60" className="w-full h-14">
                    <polyline
                      points="0,50 20,38 40,42 60,28 80,32 100,18 120,22 140,12 160,20 180,10 200,16"
                      fill="none"
                      stroke="#111"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="dark:stroke-white"
                    />
                  </svg>
                </div>

                {/* Bar chart sim */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-3">Top Videos</p>
                  <div className="space-y-1.5">
                    {[90, 65, 50, 35, 20].map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-2 bg-gray-900 dark:bg-white rounded-full" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* Mobile alternative */}
        <div className="mt-10 md:hidden grid grid-cols-2 gap-3">
        {[
            { label: "Views",       value: "284K"  },
            { label: "Subscribers", value: "12.4K" },
            { label: "Watch Time",  value: "1,842h"},
            { label: "Videos",      value: "87"    },
        ].map(({ label, value }) => (
            <div
            key={label}
            className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-left"
            >
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            What you get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart2,
                title: "Real analytics data",
                desc:  "Views, watch time, impressions, and CTR pulled directly from the YouTube Analytics API — the same data YouTube Studio uses.",
              },
              {
                icon: Filter,
                title: "Date range filtering",
                desc:  "Switch between 7, 28, and 90 day windows instantly. See how your channel is trending over any period.",
              },
              {
                icon: Shield,
                title: "Read-only and secure",
                desc:  "Sign in with Google OAuth. We only request read-only access. We never see your password or post anything to your channel.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-white dark:text-black" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Sign in with Google",
              desc:  "One click. No forms, no passwords. Google handles authentication securely.",
            },
            {
              step: "02",
              title: "Connect your channel",
              desc:  "We detect your YouTube channel automatically from your Google account.",
            },
            {
              step: "03",
              title: "See your analytics",
              desc:  "Your dashboard is ready instantly — charts, video table, and date range filters.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative">
              <span className="text-5xl font-bold text-gray-100 dark:text-gray-800 select-none">
                {step}
              </span>
              <h3 className="font-semibold mt-2 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center mt-14">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/demo"
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white underline underline-offset-4 transition-colors"
          >
            View live demo first
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t dark:border-gray-800 px-6 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-bold text-sm mb-1">YT Analytics</p>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Built by a creator, for creators. This tool is not affiliated with
              or endorsed by YouTube or Google.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:hello@yourdomain.com"
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
              hello@yourdomain.com 
              </a>
          </div>
        </div>
      </footer>

    </div>
  );
}