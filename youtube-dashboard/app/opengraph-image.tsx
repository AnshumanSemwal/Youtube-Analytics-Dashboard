import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "YT Analytics — YouTube analytics for creators";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0D0D0D",
          width:       "100%",
          height:      "100%",
          display:     "flex",
          flexDirection:"column",
          alignItems:  "flex-start",
          justifyContent: "center",
          padding:     "80px",
          fontFamily:  "sans-serif",
        }}
      >
        {/* Red accent bar */}
        <div
          style={{
            position:   "absolute",
            top:        0,
            left:       0,
            width:      "100%",
            height:     "6px",
            background: "#E53935",
          }}
        />

        {/* App name */}
        <div
          style={{
            fontSize:   20,
            color:      "#E53935",
            fontWeight: 700,
            letterSpacing: "0.1em",
            marginBottom: 24,
          }}
        >
          YT ANALYTICS
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize:   64,
            fontWeight: 800,
            color:      "#FFFFFF",
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth:   800,
          }}
        >
          YouTube analytics that go deeper than Studio.
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize:   28,
            color:      "#888888",
            fontWeight: 400,
          }}
        >
          Free for any YouTuber. No credit card required.
        </div>

        {/* Mini stat cards */}
        <div
          style={{
            display:    "flex",
            gap:        "16px",
            marginTop:  "48px",
          }}
        >
          {[
            ["Views",       "284K"],
            ["Subscribers", "14.8K"],
            ["Watch Time",  "1,842h"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "#1A1A1A",
                border:     "1px solid #333",
                borderRadius: 12,
                padding:    "16px 24px",
                display:    "flex",
                flexDirection: "column",
                gap:        "4px",
              }}
            >
              <div style={{ fontSize: 14, color: "#666" }}>{label}</div>
              <div style={{ fontSize: 28, color: "#FFF", fontWeight: 700 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}