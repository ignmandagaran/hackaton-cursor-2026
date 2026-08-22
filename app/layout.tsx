import type { Metadata, Viewport } from "next"
import { Figtree, Red_Rose } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import { type PropsWithChildren, Suspense } from "react"
import { Link } from "@/components/ui/link"
import { siteConfig } from "@/lib/config/site"
import { fontsVariable } from "@/lib/styles/fonts"
import "@/lib/styles/index.css"
import { ThemeProvider } from "@/components/layout/theme/provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/styles/cn"
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  JsonLd,
} from "@/lib/utils/json-ld"

const redRoseHeading = Red_Rose({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
})

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

const APP_NAME = siteConfig.name
const APP_DEFAULT_TITLE = siteConfig.name
const APP_TITLE_TEMPLATE = `%s - ${siteConfig.name}`
const APP_DESCRIPTION = siteConfig.description
const APP_BASE_URL = siteConfig.url

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  applicationName: APP_NAME,
  authors: [{ name: siteConfig.name }],
  description: APP_DESCRIPTION,
  formatDetection: { telephone: false },
  metadataBase: new URL(APP_BASE_URL),
  openGraph: {
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    type: "website",
    url: APP_BASE_URL,
  },
  other: {
    "fb:app_id": process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
  },
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  twitter: {
    card: "summary_large_image",
    description: APP_DESCRIPTION,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: "normal",
  themeColor: "#000000",
}

export default async function Layout({ children }: PropsWithChildren) {
  const locale = await getLocale()
  const t = await getTranslations("common")

  return (
    <html
      lang={locale}
      dir="ltr"
      className={cn(
        fontsVariable,
        "font-sans",
        figtree.variable,
        redRoseHeading.variable
      )}
      // next-themes writes the theme class on <html> client-side, which mismatches SSR
      suppressHydrationWarning
    >
      <body>
        <JsonLd
          data={generateWebSiteJsonLd({
            name: APP_DEFAULT_TITLE,
            description: APP_DESCRIPTION,
          })}
        />
        <JsonLd
          data={generateOrganizationJsonLd({
            name: APP_NAME,
          })}
        />

        <NextIntlClientProvider>
          {/* Skip link for keyboard navigation accessibility */}
          <Suspense fallback={null}>
            <Link
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              {t("skipToMain")}
            </Link>
          </Suspense>

          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
