"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const users = [
  {
    id: "1",
    name: "Alex Chen",
    role: "Engineer",
    status: "active",
    lastSeen: "Just now",
  },
  {
    id: "2",
    name: "Blair Morgan",
    role: "Designer",
    status: "active",
    lastSeen: "2m ago",
  },
  {
    id: "3",
    name: "Casey Liu",
    role: "PM",
    status: "away",
    lastSeen: "1h ago",
  },
  {
    id: "4",
    name: "Dakota Reyes",
    role: "Engineer",
    status: "offline",
    lastSeen: "Yesterday",
  },
  {
    id: "5",
    name: "Ellis Park",
    role: "Ops",
    status: "inactive",
    lastSeen: "3d ago",
  },
]

function statusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "active") return "default"
  if (status === "away") return "secondary"
  if (status === "offline") return "outline"
  return "destructive"
}

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

export function DataComponents() {
  return (
    <div className="grid desktop:grid-cols-2 grid-cols-1 gap-4">
      <ControlGroup
        title="Tabs"
        description="Section navigation with stateful panels."
      >
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-muted-foreground text-sm">
                Overview of your project metrics and recent changes.
              </p>
            </TabsContent>
            <TabsContent value="activity">
              <p className="text-muted-foreground text-sm">
                Recent activity across your team.
              </p>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-muted-foreground text-sm">
                Manage your preferences and permissions.
              </p>
            </TabsContent>
          </Tabs>

          <Tabs defaultValue="shell" className="w-full">
            <TabsList>
              <TabsTrigger
                value="shell"
                className="font-mono text-xs uppercase tracking-wide"
              >
                Shell
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="font-mono text-xs uppercase tracking-wide"
              >
                Logs
              </TabsTrigger>
              <TabsTrigger
                value="env"
                className="font-mono text-xs uppercase tracking-wide"
              >
                Env
              </TabsTrigger>
              <TabsTrigger
                value="deploy"
                className="font-mono text-xs uppercase tracking-wide"
              >
                Deploy
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shell">
              <code className="font-mono text-muted-foreground text-xs">
                $ npm run dev
              </code>
            </TabsContent>
            <TabsContent value="logs">
              <code className="font-mono text-muted-foreground text-xs">
                [INFO] server listening on :3000
              </code>
            </TabsContent>
            <TabsContent value="env">
              <code className="font-mono text-muted-foreground text-xs">
                NEXT_PUBLIC_APP_ENV=development
              </code>
            </TabsContent>
            <TabsContent value="deploy">
              <code className="font-mono text-muted-foreground text-xs">
                ✓ Deployed to production
              </code>
            </TabsContent>
          </Tabs>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Table"
        description="Tabular data with status column."
      >
        <Table>
          <TableCaption>A snapshot of team status.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {u.role}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(u.status)}
                    className="capitalize"
                  >
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {u.lastSeen}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ControlGroup>
    </div>
  )
}
