import { describe, it, expect } from "vitest"
import { calculateExcise, calculateImport, calculateLocalClearance, DEFAULT_RULES } from "@/lib/customs"
import { copartFees } from "@/lib/providers"
import Decimal from "decimal.js"

describe("Adversarial Stress Tests for Calculations", () => {
  describe("1. Excise Calculations & Age Rate Boundaries", () => {
    it("Age boundary <= 6: age = 0 (2026)", () => {
      const { excise, age, ratePerCc } = calculateExcise({
        year: 2026,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left",
      })
      expect(age).toBe(0)
      expect(ratePerCc).toBe(1.5)
      expect(excise.toNumber()).toBe(3000)
    })

    it("Age boundary <= 6: age = 6 (2020)", () => {
      const { excise, age, ratePerCc } = calculateExcise({
        year: 2020,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left",
      })
      expect(age).toBe(6)
      expect(ratePerCc).toBe(1.5)
      expect(excise.toNumber()).toBe(3000)
    })

    it("Age boundary > 6: age = 7 (2019)", () => {
      const { excise, age, ratePerCc } = calculateExcise({
        year: 2019,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left",
      })
      expect(age).toBe(7)
      expect(ratePerCc).toBe(4.5)
      expect(excise.toNumber()).toBe(9000)
    })

    it("Age extreme old (vintage classic): age = 100 (1926)", () => {
      const { excise, age, ratePerCc } = calculateExcise({
        year: 1926,
        engineCc: 3000,
        powertrain: "gasoline",
        steering: "left",
      })
      expect(age).toBe(100)
      expect(ratePerCc).toBe(4.5)
      expect(excise.toNumber()).toBe(13500)
    })

    it("Future year: age = 0 (2030)", () => {
      const { excise, age, ratePerCc } = calculateExcise({
        year: 2030,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left",
      })
      expect(age).toBe(0)
      expect(ratePerCc).toBe(1.5)
      expect(excise.toNumber()).toBe(3000)
    })
  })

  describe("2. Powertrain and Steering Multipliers", () => {
    it("Left Hand Drive Gasoline (1.0 powertrain, 1.0 steering)", () => {
      const { excise } = calculateExcise({
        year: 2020,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left",
      })
      expect(excise.toNumber()).toBe(3000)
    })

    it("Right Hand Drive Gasoline (1.0 powertrain, 3.0 steering)", () => {
      const { excise } = calculateExcise({
        year: 2020,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "right",
      })
      expect(excise.toNumber()).toBe(9000)
    })

    it("Left Hand Drive Hybrid (0.6 powertrain, 1.0 steering)", () => {
      const { excise } = calculateExcise({
        year: 2020,
        engineCc: 2000,
        powertrain: "hybrid",
        steering: "left",
      })
      expect(excise.toNumber()).toBe(1800)
    })

    it("Right Hand Drive Hybrid (0.6 powertrain, 3.0 steering)", () => {
      const { excise } = calculateExcise({
        year: 2020,
        engineCc: 2000,
        powertrain: "hybrid",
        steering: "right",
      })
      expect(excise.toNumber()).toBe(5400)
    })

    it("Left Hand Drive Electric (0 excise exception)", () => {
      const { excise } = calculateExcise({
        year: 2020,
        engineCc: 0,
        powertrain: "electric",
        steering: "left",
      })
      expect(excise.toNumber()).toBe(0)
    })

    it("Right Hand Drive Electric (0 powertrain multiplier)", () => {
      const { excise } = calculateExcise({
        year: 2020,
        engineCc: 0,
        powertrain: "electric",
        steering: "right",
      })
      expect(excise.toNumber()).toBe(0)
    })
  })

  describe("3. Copart Auto Fees Brackets", () => {
    it("Lowest bracket boundary: bid = 49.99", () => {
      const fees = copartFees(49.99)
      expect(fees.buyer).toBe(25)
      expect(fees.bidding).toBe(0)
      expect(fees.total).toBe(25 + 0 + 95 + 15 + 20)
    })

    it("Bracket transitions: bid = 50", () => {
      const fees = copartFees(50)
      expect(fees.buyer).toBe(45)
      expect(fees.bidding).toBe(0)
    })

    it("Bidding fee bracket transition: bid = 100", () => {
      const fees = copartFees(100)
      expect(fees.buyer).toBe(80)
      expect(fees.bidding).toBe(50)
    })

    it("Max bracket boundary in array: bid = 14999.99", () => {
      const fees = copartFees(14999.99)
      expect(fees.buyer).toBe(1030)
      expect(fees.bidding).toBe(160)
    })

    it("Above max bracket: bid = 15000", () => {
      const fees = copartFees(15000)
      expect(fees.buyer).toBe(15000 * 0.075)
      expect(fees.bidding).toBe(160)
      expect(fees.total).toBe(1125 + 160 + 95 + 15 + 20)
    })

    it("Extreme bid: bid = 1,000,000", () => {
      const fees = copartFees(1000000)
      expect(fees.buyer).toBe(75000)
      expect(fees.bidding).toBe(160)
      expect(fees.total).toBe(75000 + 160 + 95 + 15 + 20)
    })
  })

  describe("4. Import Calculation Completeness & Formula Integrity", () => {
    it("Verify import cost components, CIF and VAT ordering", () => {
      const vehicle = {
        provider: "copart" as const,
        externalId: "test",
        title: "Test",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2000,
        powertrain: "gasoline" as const,
        steering: "left" as const,
        price: 10000,
        currency: "USD" as const,
        sourceUrl: "",
        fetchedAt: "",
      }
      const input = {
        purchaseUsd: 10000,
        feesUsd: 1265,
        inlandUsd: 800,
        oceanUsd: 1200,
        insuranceUsd: 100,
        portUsd: 200,
        repairsUsd: 0,
        exchangeRate: 2.72,
      }
      const result = calculateImport(vehicle, input)

      expect(result.exciseGel).toBe(3000)
      expect(result.vatGel).toBe(7083.5)
      expect(result.totalGel).toBe(47330.3)

      expect(result.lines.find(l => l.label === "აუქციონზე შეძენა")?.amountGel).toBe(27200)
      expect(result.lines.find(l => l.label === "Copart-ის საკომისიოები")?.amountGel).toBe(3440.8)
      expect(result.lines.find(l => l.label === "შიდა ტრანსპორტირება (აშშ)")?.amountGel).toBe(2176)
      expect(result.lines.find(l => l.label === "საზღვაო გადაზიდვა ფოთამდე")?.amountGel).toBe(3264)
      expect(result.lines.find(l => l.label === "დაზღვევა")?.amountGel).toBe(272)
      expect(result.lines.find(l => l.label === "პორტის მომსახურება")?.amountGel).toBe(544)
      expect(result.lines.find(l => l.label === "აქციზი")?.amountGel).toBe(3000)
      expect(result.lines.find(l => l.label === "დღგ (18%)")?.amountGel).toBe(7083.5)
      expect(result.lines.find(l => l.label === "საბაჟო მომსახურება და რეგისტრაცია")?.amountGel).toBe(350)
    })
  })
})
