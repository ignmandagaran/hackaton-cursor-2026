"use client"

import { CircleNotchIcon } from "@phosphor-icons/react/ssr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

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

export function FormControls() {
  const [marketing, setMarketing] = useState<boolean | "indeterminate">(true)
  const [selectAll, setSelectAll] = useState<boolean | "indeterminate">(
    "indeterminate"
  )
  const [agree, setAgree] = useState<boolean | "indeterminate">(false)
  const [radio, setRadio] = useState("medium")
  const [timezone, setTimezone] = useState("UTC")
  const [emailNotif, setEmailNotif] = useState(false)
  const [pushNotif, setPushNotif] = useState(true)

  return (
    <div className="grid desktop:grid-cols-3 grid-cols-1 tablet:grid-cols-2 gap-4">
      <ControlGroup
        title="Button"
        description="Variants and sizes from the shadcn button primitive."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="default">default</Button>
          <Button variant="secondary">secondary</Button>
          <Button variant="outline">outline</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="destructive">destructive</Button>
          <Button variant="link">link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">xs</Button>
          <Button size="sm">sm</Button>
          <Button size="default">default</Button>
          <Button size="lg">lg</Button>
          <Button disabled>disabled</Button>
          <Button aria-busy disabled>
            <CircleNotchIcon className="animate-spin" />
            Loading
          </Button>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Input"
        description="Text inputs across default, filled, disabled and invalid states."
      >
        <Input placeholder="Placeholder" />
        <Input defaultValue="hello@example.com" />
        <Input disabled placeholder="Disabled" />
        <div className="flex flex-col gap-1">
          <Input aria-invalid defaultValue="not-an-email" />
          <span className="text-destructive text-xs">
            Please enter a valid email
          </span>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Textarea"
        description="Multi-line text field with field-sizing content."
      >
        <Textarea placeholder="Write a message..." />
        <Textarea
          defaultValue={
            "Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit,\nsed do eiusmod tempor."
          }
        />
        <Textarea disabled placeholder="Disabled" />
      </ControlGroup>

      <ControlGroup
        title="Label + Input"
        description="Idiomatic label paired with an input via htmlFor."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="demo-email">Email</Label>
          <Input id="demo-email" placeholder="you@example.com" />
        </div>
      </ControlGroup>

      <ControlGroup
        title="Checkbox"
        description="Unchecked, checked, indeterminate and disabled states."
      >
        <div className="flex items-center gap-2">
          <Checkbox id="cb-agree" checked={agree} onCheckedChange={setAgree} />
          <Label htmlFor="cb-agree">I agree</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="cb-marketing"
            checked={marketing}
            onCheckedChange={setMarketing}
          />
          <Label htmlFor="cb-marketing">Marketing emails</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="cb-all"
            checked={selectAll}
            onCheckedChange={setSelectAll}
          />
          <Label htmlFor="cb-all">Select all</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cb-disabled" disabled />
          <Label htmlFor="cb-disabled">Disabled option</Label>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Radio group"
        description="Mutually exclusive selection controlled via state."
      >
        <RadioGroup value={radio} onValueChange={setRadio}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="small" id="r-small" />
            <Label htmlFor="r-small">Small</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="medium" id="r-medium" />
            <Label htmlFor="r-medium">Medium</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="large" id="r-large" />
            <Label htmlFor="r-large">Large</Label>
          </div>
        </RadioGroup>
      </ControlGroup>

      <ControlGroup
        title="Select"
        description="Dropdown menu backed by Radix Select primitive."
      >
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="America/New_York">America/New_York</SelectItem>
            <SelectItem value="America/Los_Angeles">
              America/Los_Angeles
            </SelectItem>
            <SelectItem value="Europe/London">Europe/London</SelectItem>
            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
          </SelectContent>
        </Select>
      </ControlGroup>

      <ControlGroup
        title="Switch"
        description="Binary on/off toggle with controlled and disabled states."
      >
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="sw-email">Email notifications</Label>
          <Switch
            id="sw-email"
            checked={emailNotif}
            onCheckedChange={setEmailNotif}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="sw-push">Push notifications</Label>
          <Switch
            id="sw-push"
            checked={pushNotif}
            onCheckedChange={setPushNotif}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="sw-sms">SMS notifications</Label>
          <Switch id="sw-sms" disabled />
        </div>
      </ControlGroup>
    </div>
  )
}
