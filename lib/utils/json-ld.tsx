import type {
  Article,
  BreadcrumbList,
  Organization,
  SearchAction,
  Thing,
  WebPage,
  WebSite,
  WithContext,
} from "schema-dts"

const APP_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value)
}

function resolveUrl(value?: string) {
  if (!value) return APP_BASE_URL
  if (isAbsoluteUrl(value)) return value
  if (!APP_BASE_URL) return undefined

  return new URL(value, APP_BASE_URL).toString()
}

/* -------------------------------- Component ------------------------------- */

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}

/* -------------------------------- Generators ------------------------------ */

interface WebSiteJsonLdOptions {
  name: string
  url?: string
  description?: string
  /** URL to site-wide search (e.g. "/search?q={search_term_string}") */
  searchUrl?: string
}

export function generateWebSiteJsonLd(
  options: WebSiteJsonLdOptions
): WithContext<WebSite> {
  const { name, url, description, searchUrl } = options
  const resolvedUrl = resolveUrl(url)
  const resolvedSearchUrl = resolveUrl(searchUrl)

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    ...(resolvedUrl && { url: resolvedUrl }),
    ...(description && { description }),
    ...(resolvedSearchUrl && {
      potentialAction: {
        "@type": "SearchAction",
        target: resolvedSearchUrl,
        "query-input": "required name=search_term_string",
      } as SearchAction & { "query-input": string },
    }),
  }
}

interface OrganizationJsonLdOptions {
  name: string
  url?: string
  logo?: string
  description?: string
  sameAs?: string[]
}

export function generateOrganizationJsonLd(
  options: OrganizationJsonLdOptions
): WithContext<Organization> {
  const { name, url, logo, description, sameAs } = options
  const resolvedUrl = resolveUrl(url)
  const resolvedLogo = resolveUrl(logo)

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    ...(resolvedUrl && { url: resolvedUrl }),
    ...(resolvedLogo && { logo: resolvedLogo }),
    ...(description && { description }),
    ...(sameAs && { sameAs }),
  }
}

interface WebPageJsonLdOptions {
  title: string
  url?: string
  description?: string
  image?: string
  datePublished?: string
  dateModified?: string
}

export function generateWebPageJsonLd(
  options: WebPageJsonLdOptions
): WithContext<WebPage> {
  const { title, url, description, image, datePublished, dateModified } =
    options
  const resolvedUrl = resolveUrl(url)
  const resolvedImage = resolveUrl(image)

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    ...(resolvedUrl && { url: resolvedUrl }),
    ...(description && { description }),
    ...(resolvedImage && { image: resolvedImage }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
  }
}

interface ArticleJsonLdOptions {
  title: string
  url?: string
  description?: string
  image?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
  authorUrl?: string
}

export function generateArticleJsonLd(
  options: ArticleJsonLdOptions
): WithContext<Article> {
  const {
    title,
    url,
    description,
    image,
    datePublished,
    dateModified,
    authorName,
    authorUrl,
  } = options
  const resolvedUrl = resolveUrl(url)
  const resolvedImage = resolveUrl(image)

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    ...(resolvedUrl && { url: resolvedUrl }),
    ...(description && { description }),
    ...(resolvedImage && { image: resolvedImage }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(authorName && {
      author: {
        "@type": "Person",
        name: authorName,
        ...(authorUrl && { url: authorUrl }),
      },
    }),
  }
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbJsonLd(
  items: BreadcrumbItem[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const resolvedItemUrl = resolveUrl(item.url)

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(resolvedItemUrl && { item: resolvedItemUrl }),
      }
    }),
  }
}
