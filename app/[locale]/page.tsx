import { getTranslations, setRequestLocale } from "next-intl/server"
import { Wrapper } from "@/components/layout/wrapper"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("home")

  return (
    <Wrapper>
      <section className="flex grow items-center justify-center">
        <h1 className="font-mono text-xl uppercase">{t("title")}</h1>
      </section>
    </Wrapper>
  )
}
