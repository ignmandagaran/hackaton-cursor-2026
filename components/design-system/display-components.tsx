"use client"

import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

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

export function DisplayComponents() {
  return (
    <div className="grid desktop:grid-cols-3 grid-cols-1 tablet:grid-cols-2 gap-4">
      <ControlGroup title="Badge" description="Compact status labels.">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="destructive">destructive</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            <CheckCircleIcon />
            Success
          </Badge>
          <Badge variant="destructive">
            <WarningIcon />
            Warning
          </Badge>
          <Badge variant="secondary">
            <InfoIcon />
            Info
          </Badge>
          <Badge variant="outline">
            <XCircleIcon />
            Error
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm">sm</Badge>
          <Badge size="default">default</Badge>
          <Badge size="lg">lg</Badge>
          <Badge size="sm" variant="outline">
            <CheckCircleIcon />
            sm
          </Badge>
          <Badge size="lg" variant="secondary">
            <InfoIcon />
            lg
          </Badge>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Avatar"
        description="User identity with graceful fallback."
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/does-not-exist.jpg" alt="AB" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              JD
            </AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="/does-not-exist.jpg" alt="AB" />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                JD
              </AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Card"
        description="Content container with header/footer."
      >
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <p>You are on the Pro plan.</p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" variant="outline">
                Manage
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardContent>Just a content-only card.</CardContent>
          </Card>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Separator"
        description="Horizontal and vertical dividers."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-sm">
            <span>Profile</span>
            <Separator />
            <span>Settings</span>
            <Separator />
            <span>Billing</span>
          </div>
          <div className="flex h-6 items-center gap-4 text-sm">
            <span>Profile</span>
            <Separator orientation="vertical" />
            <span>Settings</span>
            <Separator orientation="vertical" />
            <span>Billing</span>
          </div>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Skeleton"
        description="Loading placeholders with shape."
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </ControlGroup>

      <ControlGroup
        title="Spinner"
        description="Loading indicator, three sizes."
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <Spinner size="sm" />
            <span className="text-muted-foreground text-xs">sm</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Spinner size="md" />
            <span className="text-muted-foreground text-xs">md</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Spinner size="lg" />
            <span className="text-muted-foreground text-xs">lg</span>
          </div>
        </div>
      </ControlGroup>
    </div>
  )
}
