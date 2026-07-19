import Decimal from "decimal.js"
import type { CostLine, Powertrain, Steering, Vehicle } from "@/lib/vehicles"

export type Rules = {
  vatRate: number
  youngMaxAge: number
  ratePerCcYoung: number
  ratePerCcOld: number
  steering: Record<Steering, number>
  powertrain: Record<Powertrain, number>
  fixedFeesGel: number
}

export const DEFAULT_RULES: Rules = {
  vatRate: 0.18,
  youngMaxAge: 6,
  ratePerCcYoung: 1.5,
  ratePerCcOld: 4.5,
  steering: { left: 1, right: 3 },
  powertrain: { gasoline: 1, diesel: 1, hybrid: 0.6, electric: 0 },
  fixedFeesGel: 350,
}

export function parseRules(vatRate: number, raw: any): Rules {
  if (!raw || typeof raw.ratePerCcYoung !== "number") return DEFAULT_RULES
  return {
    vatRate,
    youngMaxAge: Number(raw.youngMaxAge ?? 6),
    ratePerCcYoung: Number(raw.ratePerCcYoung),
    ratePerCcOld: Number(raw.ratePerCcOld),
    steering: raw.steering as Record<Steering, number>,
    powertrain: raw.powertrain as Record<Powertrain, number>,
    fixedFeesGel: Number(raw.fixedFeesGel ?? 350),
  }
}

export function calculateExcise(vehicle: Pick<Vehicle, "year" | "engineCc" | "powertrain" | "steering">, rules = DEFAULT_RULES) {
  const age = Math.max(0, 2026 - vehicle.year)
  const ratePerCc = age <= rules.youngMaxAge ? rules.ratePerCcYoung : rules.ratePerCcOld
  if (vehicle.powertrain === "electric" && vehicle.steering === "left") {
    return { excise: new Decimal(0), age, ratePerCc: 0 }
  }
  const excise = new Decimal(vehicle.engineCc)
    .mul(ratePerCc)
    .mul(rules.powertrain[vehicle.powertrain])
    .mul(rules.steering[vehicle.steering])
  return { excise, age, ratePerCc }
}

export type ImportInput = {
  purchaseUsd: number
  feesUsd: number
  inlandUsd: number
  oceanUsd: number
  insuranceUsd: number
  portUsd: number
  repairsUsd: number
  exchangeRate: number
}

export function calculateImport(vehicle: Vehicle, input: ImportInput, rules = DEFAULT_RULES) {
  const d = (value: number) => new Decimal(value)
  const fx = d(input.exchangeRate)
  const usdLine = (usd: number) => d(usd).mul(fx)

  const purchaseGel = usdLine(input.purchaseUsd)
  const feesGel = usdLine(input.feesUsd)
  const inlandGel = usdLine(input.inlandUsd)
  const oceanGel = usdLine(input.oceanUsd)
  const insuranceGel = usdLine(input.insuranceUsd)
  const portGel = usdLine(input.portUsd)
  const repairsGel = usdLine(input.repairsUsd)

  const cif = purchaseGel.plus(feesGel).plus(inlandGel).plus(oceanGel).plus(insuranceGel)
  const { excise, age, ratePerCc } = calculateExcise(vehicle, rules)
  const vat = cif.plus(excise).mul(rules.vatRate)
  const total = cif.plus(portGel).plus(excise).plus(vat).plus(rules.fixedFeesGel).plus(repairsGel)

  const round = (value: Decimal) => value.toDecimalPlaces(2).toNumber()
  const lines: CostLine[] = [
    { label: "აუქციონზე შეძენა", amountGel: round(purchaseGel), hint: `${input.purchaseUsd.toLocaleString()} USD` },
    { label: "Copart-ის საკომისიოები", amountGel: round(feesGel), hint: `${input.feesUsd.toLocaleString()} USD - მყიდველის, ბიდის, გეითის მოსაკრებლები` },
    { label: "შიდა ტრანსპორტირება (აშშ)", amountGel: round(inlandGel), hint: `${input.inlandUsd.toLocaleString()} USD` },
    { label: "საზღვაო გადაზიდვა ფოთამდე", amountGel: round(oceanGel), hint: `${input.oceanUsd.toLocaleString()} USD` },
    { label: "დაზღვევა", amountGel: round(insuranceGel), hint: `${input.insuranceUsd.toLocaleString()} USD` },
    { label: "პორტის მომსახურება", amountGel: round(portGel), hint: `${input.portUsd.toLocaleString()} USD` },
    {
      label: "აქციზი",
      amountGel: round(excise),
      hint: vehicle.powertrain === "electric" && vehicle.steering === "left"
        ? "ელექტრომობილი - გათავისუფლებულია"
        : `${vehicle.engineCc.toLocaleString()} სმ³ × ${ratePerCc} ₾ (ასაკი ${age} წ.)${vehicle.powertrain === "hybrid" ? " × 0.6 ჰიბრიდი" : ""}${vehicle.steering === "right" ? " × 3 მარჯვენა საჭე" : ""}`,
    },
    { label: `დღგ (${Math.round(rules.vatRate * 100)}%)`, amountGel: round(vat), hint: "CIF ღირებულება + აქციზი" },
    { label: "საბაჟო მომსახურება და რეგისტრაცია", amountGel: rules.fixedFeesGel },
  ]
  if (input.repairsUsd > 0) {
    lines.push({ label: "სავარაუდო შეკეთება", amountGel: round(repairsGel), hint: `${input.repairsUsd.toLocaleString()} USD` })
  }
  return { lines, totalGel: round(total), exciseGel: round(excise), vatGel: round(vat), age, ratePerCc }
}

export function calculateLocalClearance(vehicle: Vehicle, valueGel: number, rules = DEFAULT_RULES) {
  const { excise, age, ratePerCc } = calculateExcise(vehicle, rules)
  const vat = new Decimal(valueGel).plus(excise).mul(rules.vatRate)
  const total = excise.plus(vat).plus(rules.fixedFeesGel)
  const round = (value: Decimal) => value.toDecimalPlaces(2).toNumber()
  return { exciseGel: round(excise), vatGel: round(vat), fixedFeesGel: rules.fixedFeesGel, totalGel: round(total), age, ratePerCc }
}
