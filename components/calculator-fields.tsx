"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

const fieldShell =
  "h-11 rounded-xl bg-background shadow-none transition-[border-color,box-shadow,background-color] hover:bg-muted/20 focus-within:ring-ring/35"

export const calculatorControlShell =
  "h-11 w-full rounded-xl bg-background shadow-none transition-[border-color,box-shadow,background-color] hover:bg-muted/20 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35"

export const formInputShell =
  "h-11 w-full rounded-xl border border-foreground/10 bg-background shadow-none outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-foreground/15 hover:bg-muted/10 focus-visible:border-primary/35 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/12"

const control =
  "h-full font-mono text-sm tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

type BaseProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function UsdField({
  id,
  value,
  onChange,
  placeholder = "0",
  required,
  disabled,
  min = "0",
  className,
}: BaseProps & { min?: string }) {
  const numeric = Number(value)
  const isValid = value !== "" && Number.isFinite(numeric) && numeric >= Number(min)

  return (
    <InputGroup className={cn(fieldShell, className)} data-disabled={disabled || undefined}>
      <InputGroupAddon align="inline-start" className="pl-3.5">
        <InputGroupText className="font-mono text-xs font-semibold tracking-wide text-muted-foreground">
          USD
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupAddon align="inline-start" className="px-0 text-muted-foreground/35" aria-hidden="true">
        <span className="h-5 w-px bg-border" />
      </InputGroupAddon>
      <InputGroupAddon align="inline-start" className="pl-2 pr-0">
        <InputGroupText className="font-mono text-sm font-medium text-foreground/70">$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="number"
        min={min}
        inputMode="decimal"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(control, "pl-1 pr-2")}
        aria-invalid={value !== "" && !isValid ? true : undefined}
      />
    </InputGroup>
  )
}

export function YearField({
  id,
  value,
  onChange,
  placeholder = "2022",
  required,
  disabled,
  min = "1990",
  max = "2026",
  className,
}: BaseProps & { min?: string; max?: string }) {
  const numeric = Number(value)
  const isValid =
    value !== "" &&
    Number.isFinite(numeric) &&
    numeric >= Number(min) &&
    numeric <= Number(max)

  return (
    <InputGroup className={cn(fieldShell, className)} data-disabled={disabled || undefined}>
      <InputGroupInput
        id={id}
        type="number"
        min={min}
        max={max}
        inputMode="numeric"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(control, "pl-3.5")}
        aria-invalid={value !== "" && !isValid ? true : undefined}
      />
      <InputGroupAddon align="inline-end" className="pr-3.5">
        <InputGroupText className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          წ.
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function EngineField({
  id,
  value,
  onChange,
  placeholder = "2000",
  required,
  disabled,
  min = "1",
  className,
}: BaseProps & { min?: string }) {
  const numeric = Number(value)
  const isValid = value !== "" && Number.isFinite(numeric) && numeric >= Number(min)
  const liters = isValid ? (numeric / 1000).toFixed(1) : null

  return (
    <InputGroup className={cn(fieldShell, className)} data-disabled={disabled || undefined}>
      <InputGroupInput
        id={id}
        type="number"
        min={min}
        inputMode="numeric"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(control, "pl-3.5")}
        aria-invalid={value !== "" && !isValid ? true : undefined}
      />
      <InputGroupAddon align="inline-end" className="gap-2 pr-3.5">
        {liters && (
          <InputGroupText className="hidden font-mono text-[11px] tabular-nums text-muted-foreground/80 sm:inline">
            {liters} ლ
          </InputGroupText>
        )}
        <InputGroupText className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          cm³
        </InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function NumberField({
  id,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  min = "0",
  suffix,
  prefix,
  className,
}: BaseProps & { min?: string; suffix?: string; prefix?: string }) {
  const numeric = Number(value)
  const isValid = value !== "" && Number.isFinite(numeric) && numeric >= Number(min)

  return (
    <InputGroup className={cn(fieldShell, className)} data-disabled={disabled || undefined}>
      {prefix && (
        <InputGroupAddon align="inline-start" className="pl-3.5">
          <InputGroupText className="font-mono text-xs text-muted-foreground">{prefix}</InputGroupText>
        </InputGroupAddon>
      )}
      <InputGroupInput
        id={id}
        type="number"
        min={min}
        inputMode="decimal"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(control, prefix ? "pl-1" : "pl-3.5")}
        aria-invalid={value !== "" && !isValid ? true : undefined}
      />
      {suffix && (
        <InputGroupAddon align="inline-end" className="pr-3.5">
          <InputGroupText className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {suffix}
          </InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
