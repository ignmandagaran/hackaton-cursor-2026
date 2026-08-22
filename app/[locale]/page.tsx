import { getTranslations, setRequestLocale } from "next-intl/server"
import { Wrapper } from "@/components/layout/wrapper"
import { MovementForm } from "@/components/movement/movement-form"

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
      <section className="flex grow flex-col items-center px-4 py-10">
        <div className="mb-8 w-full max-w-xl text-center">
          <h1 className="font-heading font-medium text-2xl">
            {t("movementTitle")}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {t("movementSubtitle")}
          </p>
        </div>
        <MovementForm />
      </section>
    </Wrapper>
  )
}
