"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/components/ui/link"
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

function useSubmittedFlash() {
  const [submitted, setSubmitted] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function flash() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setSubmitted(true)
    timeoutRef.current = setTimeout(() => setSubmitted(false), 2000)
  }

  return { submitted, flash }
}

function CardHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-mono text-foreground text-xs uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  )
}

function SubmittedIndicator({ visible }: { visible: boolean }) {
  return (
    <p aria-live="polite" className="min-h-4 text-muted-foreground text-xs">
      {visible ? "Submitted \u2713" : ""}
    </p>
  )
}

function LoginForm() {
  const { submitted, flash } = useSubmittedFlash()
  const [remember, setRemember] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    flash()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6"
    >
      <CardHeader title="Login" description="Standard credential entry." />
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="login-remember" className="font-normal text-sm">
          <Checkbox
            id="login-remember"
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
          />
          Remember me
        </Label>
        <Link
          href="/forgot-password"
          className="text-foreground text-sm underline underline-offset-4 hover:text-primary"
        >
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
      <SubmittedIndicator visible={submitted} />
    </form>
  )
}

function SignupForm() {
  const { submitted, flash } = useSubmittedFlash()
  const [agree, setAgree] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    flash()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6"
    >
      <CardHeader
        title="Signup"
        description="New account with validation states."
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input id="signup-name" autoComplete="name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" autoComplete="email" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid
          aria-describedby="signup-confirm-error"
        />
        <p id="signup-confirm-error" className="text-destructive text-xs">
          Passwords do not match
        </p>
      </div>
      <Label htmlFor="signup-terms" className="font-normal text-sm">
        <Checkbox
          id="signup-terms"
          checked={agree}
          onCheckedChange={(v) => setAgree(v === true)}
        />
        I agree to the Terms of Service
      </Label>
      <Button type="submit" className="w-full">
        Create account
      </Button>
      <SubmittedIndicator visible={submitted} />
    </form>
  )
}

function SettingsForm() {
  const { submitted, flash } = useSubmittedFlash()
  const [notifications, setNotifications] = React.useState(true)
  const [timezone, setTimezone] = React.useState("UTC")
  const [theme, setTheme] = React.useState("system")
  const [bio, setBio] = React.useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    flash()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6"
    >
      <CardHeader
        title="Account settings"
        description="Grouped composition of toggles, selects, and free text."
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="settings-notifications">Notifications</Label>
          <Switch
            id="settings-notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <div className="flex flex-col gap-2 border-border border-t pt-4">
          <Label htmlFor="settings-timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="settings-timezone" className="w-full">
              <SelectValue />
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
        </div>

        <div className="flex flex-col gap-2 border-border border-t pt-4">
          <Label>Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="flex gap-4"
          >
            <Label htmlFor="theme-light" className="font-normal text-sm">
              <RadioGroupItem id="theme-light" value="light" />
              Light
            </Label>
            <Label htmlFor="theme-dark" className="font-normal text-sm">
              <RadioGroupItem id="theme-dark" value="dark" />
              Dark
            </Label>
            <Label htmlFor="theme-system" className="font-normal text-sm">
              <RadioGroupItem id="theme-system" value="system" />
              System
            </Label>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2 border-border border-t pt-4">
          <Label htmlFor="settings-bio">Bio</Label>
          <Textarea
            id="settings-bio"
            placeholder="Tell us about yourself"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
      <SubmittedIndicator visible={submitted} />
    </form>
  )
}

export function FormLayouts() {
  return (
    <div className="grid desktop:grid-cols-3 grid-cols-1 gap-6">
      <LoginForm />
      <SignupForm />
      <SettingsForm />
    </div>
  )
}
