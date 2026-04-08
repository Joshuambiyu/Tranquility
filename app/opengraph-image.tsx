import { ImageResponse } from "next/og"; //converts jsx into image on the edge runtime

export const runtime = "edge";
export const alt = "TranquilityHub — Pause. Reflect. Grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #065f46 0%, #059669 35%, #10b981 65%, #34d399 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle noise-like mesh overlay */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-150px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-250px",
            left: "-100px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,95,70,0.5) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "60px",
            padding: "0 80px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "200px",
              height: "200px",
              borderRadius: "52px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          >
            <svg
              width="140"
              height="140"
              viewBox="0 0 256 256"
              fill="none"
            >
              <path
                d="M136 46C175 62 199 101 199 145C199 187 171 221 128 221C85 221 57 188 57 146C57 104 84 70 122 56C109 72 104 91 104 110C104 147 132 168 163 168C154 152 148 134 148 115C148 91 153 68 136 46Z"
                fill="rgba(255,255,255,0.95)"
              />
              <path
                d="M45 156C70 139 95 136 122 147C98 161 86 183 82 210C64 196 50 177 45 156Z"
                fill="rgba(167,210,230,0.8)"
              />
              <circle cx="184" cy="72" r="10" fill="rgba(200,225,240,0.7)" />
            </svg>
          </div>

          {/* Text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase" as const,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Welcome to
            </div>
            <div
              style={{
                fontSize: "72px",
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              TranquilityHub
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Pause. Reflect. Grow.
            </div>
          </div>
        </div>

        {/* Bottom URL strip */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "48px",
            fontSize: "15px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.04em",
          }}
        >
          tranquilityhub.co.ke
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
