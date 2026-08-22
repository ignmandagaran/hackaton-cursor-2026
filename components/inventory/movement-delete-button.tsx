"use client"

import { TrashIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteMovement } from "@/lib/actions/movement"
import { formatKg } from "@/lib/inventory/format-kg"
import { formatRoute } from "@/lib/inventory/format-route"
import type { RecentMovement } from "@/lib/inventory/movements"

export function MovementDeleteButton({
  movement,
}: {
  movement: RecentMovement
}) {
  const t = useTranslations("movements")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (movement.deletedAt) return null

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMovement(movement.id)

      if (!result.ok) {
        toast.error(result.error.message)
        return
      }

      toast.success(t("deleteSuccess"))
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={t("deleteAriaLabel")}
        >
          <TrashIcon />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t("deleteTitle")}</DialogTitle>
          <DialogDescription>{t("deleteDescription")}</DialogDescription>
        </DialogHeader>
        <div className="rounded-3xl bg-muted/50 px-4 py-3 text-sm">
          <p className="font-medium">
            {formatKg(movement.quantityKg)} · {movement.lotCode}
          </p>
          <p className="mt-1 text-muted-foreground">
            {formatRoute(movement)}
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              {t("deleteCancel")}
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? t("deletePending") : t("deleteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
