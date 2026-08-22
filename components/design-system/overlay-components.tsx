"use client"

import {
  CheckCircleIcon,
  InfoIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

function ControlGroup({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded border border-border bg-card p-4">
      <header className="flex flex-col gap-1">
        <h3 className="font-mono text-foreground text-xs uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

export function OverlayComponents() {
  return (
    <div className="grid desktop:grid-cols-3 grid-cols-1 tablet:grid-cols-2 gap-4">
      <ControlGroup
        title="Dialog"
        description="Modal overlays for focused actions."
      >
        <div className="flex flex-col gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Delete account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete account?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Your account and data will be
                  permanently removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Rename…</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename project</DialogTitle>
                <DialogDescription>
                  Enter a new name for this project.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rename-input">Name</Label>
                <Input id="rename-input" defaultValue="my-project" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Drawer"
        description="Swipeable panels that snap from an edge (vaul)."
      >
        <div className="flex flex-col gap-3">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open bottom drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>
                  Drag down or tap outside to dismiss.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Apply filters</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button variant="outline">Open side drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Cart</DrawerTitle>
                <DrawerDescription>
                  Review the items in your cart.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Checkout</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Keep shopping</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Toast"
        description="Transient notifications via sonner. Stack bottom-right."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast("Changes saved")}>
            Default
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Deployment successful")}
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Unable to save changes")}
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast("Project archived", {
                description: "You can restore it from the trash anytime.",
                action: {
                  label: "Undo",
                  onClick: () => toast("Restored"),
                },
              })
            }
          >
            With action
          </Button>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Progress"
        description="Determinate and indeterminate loading."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Uploading</span>
              <span>25%</span>
            </div>
            <Progress value={25} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Processing</span>
              <span>50%</span>
            </div>
            <Progress value={50} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Syncing</span>
              <span>80%</span>
            </div>
            <Progress value={80} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Done</span>
              <span>100%</span>
            </div>
            <Progress value={100} />
          </div>
          <div className="flex animate-pulse flex-col gap-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Indeterminate</span>
            </div>
            <Progress />
          </div>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Callout"
        description="Inline messages with severity."
      >
        <div className="flex flex-col gap-3">
          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>Your data is encrypted at rest.</AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <XCircleIcon />
            <AlertTitle>Unable to save</AlertTitle>
            <AlertDescription>
              We couldn&apos;t save your changes. Please retry.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <CheckCircleIcon />
            <AlertTitle>Deployment successful</AlertTitle>
            <AlertDescription>
              Your project is live at example.com.
            </AlertDescription>
          </Alert>
        </div>
      </ControlGroup>
    </div>
  )
}
