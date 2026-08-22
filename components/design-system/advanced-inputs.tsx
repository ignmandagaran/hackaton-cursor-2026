"use client"

import {
  CaretUpDownIcon,
  CheckIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react/ssr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/styles/cn"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "svelte", label: "SvelteKit" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "solid", label: "SolidStart" },
  { value: "qwik", label: "Qwik" },
  { value: "analog", label: "Analog" },
  { value: "tanstack", label: "TanStack Start" },
  { value: "gatsby", label: "Gatsby" },
]

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals.",
    price: "$0",
  },
  { id: "pro", name: "Pro", description: "For small teams.", price: "$20/mo" },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations.",
    price: "Contact",
  },
]

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

export function AdvancedInputs() {
  const [single, setSingle] = useState([40])
  const [range, setRange] = useState([20, 80])
  const [period, setPeriod] = useState("week")
  const [formatting, setFormatting] = useState<string[]>([])
  const [selectedPlans, setSelectedPlans] = useState<string[]>(["pro"])
  const [open, setOpen] = useState(false)
  const [framework, setFramework] = useState<string>("")

  function togglePlan(id: string) {
    setSelectedPlans((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="grid desktop:grid-cols-3 grid-cols-1 tablet:grid-cols-2 gap-4">
      <ControlGroup
        title="Slider"
        description="Single value, range, and disabled."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Single</span>
              <span>Value: {single[0]}</span>
            </div>
            <Slider
              value={single}
              onValueChange={setSingle}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Range</span>
              <span>
                Range: {range[0]} – {range[1]}
              </span>
            </div>
            <Slider
              value={range}
              onValueChange={setRange}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Disabled</span>
            </div>
            <Slider defaultValue={[50]} disabled />
          </div>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Segmented Controls"
        description="Single and multi-select toggle groups."
      >
        <div className="flex flex-col gap-4">
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(v) => v && setPeriod(v)}
            variant="outline"
          >
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="multiple"
            value={formatting}
            onValueChange={setFormatting}
            variant="outline"
          >
            <ToggleGroupItem value="bold" aria-label="Bold">
              <TextBIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <TextItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <TextUnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </ControlGroup>

      <ControlGroup
        title="Checkbox Cards"
        description="Selectable cards for multi-option choices."
      >
        <div className="grid grid-cols-1 gap-2">
          {plans.map((plan) => (
            <label
              key={plan.id}
              htmlFor={`plan-${plan.id}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40",
                selectedPlans.includes(plan.id)
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <Checkbox
                id={`plan-${plan.id}`}
                checked={selectedPlans.includes(plan.id)}
                onCheckedChange={() => togglePlan(plan.id)}
                className="mt-0.5"
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium text-sm">{plan.name}</span>
                <span className="text-muted-foreground text-xs">
                  {plan.description}
                </span>
              </div>
              <span className="font-mono text-muted-foreground text-xs">
                {plan.price}
              </span>
            </label>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup
        title="Combobox"
        description="Searchable select with 10+ options."
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {framework
                ? frameworks.find((f) => f.value === framework)?.label
                : "Select framework…"}
              <CaretUpDownIcon className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandInput placeholder="Search framework…" />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {frameworks.map((f) => (
                    <CommandItem
                      key={f.value}
                      value={f.value}
                      onSelect={(currentValue) => {
                        setFramework(
                          currentValue === framework ? "" : currentValue
                        )
                        setOpen(false)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 size-4",
                          framework === f.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {f.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </ControlGroup>
    </div>
  )
}
