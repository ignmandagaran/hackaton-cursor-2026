import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/styles/cn"

export function Wrapper({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className={cn("relative flex grow flex-col", className)}
        {...props}
      >
        {children}
      </main>
      <Footer />
    </>
  )
}
