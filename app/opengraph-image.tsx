import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/config/site"

export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        gap: 12,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: 160,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        {siteConfig.name}
      </div>
      <div
        style={{
          color: "#888",
          fontSize: 28,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {siteConfig.description}
      </div>
    </div>,
    size
  )
}
