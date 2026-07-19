import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as compareHandler } from '@/app/api/compare/route';
import { POST as customsHandler } from '@/app/api/calculate/customs/route';
import { POST as importHandler } from '@/app/api/calculate/import/route';
import { POST as analyzeHandler } from '@/app/api/compare/analyze/route';
import { POST as chatHandler } from '@/app/api/compare/chat/route';
import { fetchCopart, fetchMyAuto, copartFromSlug } from '@/lib/providers';
import { getUsdGelRate } from '@/lib/exchange';

vi.mock('@/lib/providers', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/providers')>();
  return {
    ...original,
    fetchCopart: vi.fn(),
    fetchMyAuto: vi.fn(),
    copartFromSlug: vi.fn(),
  };
});

vi.mock('@/lib/exchange', () => ({
  getUsdGelRate: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => null),
}));

let ipCounter = 0;
async function callApi(handler: (req: Request) => Promise<Response>, body: any, headers: Record<string, string> = {}) {
  ipCounter++;
  const fakeIp = `192.168.1.${ipCounter}`;
  const req = new Request('http://localhost/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': fakeIp,
      ...headers
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return handler(req);
}

describe('E2E Test Suite (38 Cases)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUsdGelRate).mockResolvedValue({ rate: 2.72, source: "ეროვნული ბანკი (NBG)" });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Tier 1 - Feature 1: Vehicle Cost Comparison (/api/compare)', () => {
    it('1. Compare standard LHD Gasoline car (happy path)', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        price: 8000,
        currency: "USD",
        stateCode: "TX",
        location: "Houston, TX",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        price: 18000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 8000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(42405.11);
      expect(json.localTotalGel).toBe(48960);
      expect(json.differenceGel).toBe(6554.89);
      expect(json.savingsPercent).toBe(13.4);
      expect(json.roiPercent).toBe(15.5);
      expect(json.verdict).toBe("import");
    });

    it('2. Compare LHD Hybrid car (0.6 excise benefit)', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "hybrid",
        steering: "left",
        price: 8000,
        currency: "USD",
        stateCode: "TX",
        location: "Houston, TX",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "hybrid",
        steering: "left",
        price: 18000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 8000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(40635.11);
      expect(json.localTotalGel).toBe(48960);
      expect(json.differenceGel).toBe(8324.89);
      expect(json.verdict).toBe("import");
      const exciseLine = json.importLines.find((l: any) => l.label === "აქციზი");
      expect(exciseLine.amountGel).toBe(2250);
    });

    it('3. Compare LHD Electric car (0 excise)', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 0,
        powertrain: "electric",
        steering: "left",
        price: 8000,
        currency: "USD",
        stateCode: "TX",
        location: "Houston, TX",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 0,
        powertrain: "electric",
        steering: "left",
        price: 18000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 8000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(37980.11);
      expect(json.localTotalGel).toBe(48960);
      expect(json.differenceGel).toBe(10979.89);
      expect(json.verdict).toBe("import");
      const exciseLine = json.importLines.find((l: any) => l.label === "აქციზი");
      expect(exciseLine.amountGel).toBe(0);
    });

    it('4. Compare LHD Diesel car', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "diesel",
        steering: "left",
        price: 8000,
        currency: "USD",
        stateCode: "TX",
        location: "Houston, TX",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "diesel",
        steering: "left",
        price: 18000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 8000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(42405.11);
      expect(json.localTotalGel).toBe(48960);
      expect(json.differenceGel).toBe(6554.89);
      expect(json.verdict).toBe("import");
    });

    it('5. Compare RHD Gasoline car (3x steering factor)', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "right",
        price: 8000,
        currency: "USD",
        stateCode: "TX",
        location: "Houston, TX",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "right",
        price: 18000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 8000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(51255.11);
      expect(json.localTotalGel).toBe(48960);
      expect(json.differenceGel).toBe(2295.11);
      expect(json.verdict).toBe("local");
    });
  });

  describe('Tier 1 - Feature 2: Customs Calculator (/api/calculate/customs)', () => {
    it('6. Calculate LHD Gasoline customs', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left'
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(35986);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(5436);
    });

    it('7. Calculate LHD Diesel customs', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'diesel',
        steering: 'left'
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(35986);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(5436);
    });

    it('8. Calculate LHD Hybrid customs', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'hybrid',
        steering: 'left'
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(34570);
      expect(json.exciseGel).toBe(1800);
      expect(json.vatGel).toBe(5220);
    });

    it('9. Calculate LHD Electric customs', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 0,
        powertrain: 'electric',
        steering: 'left'
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(32446);
      expect(json.exciseGel).toBe(0);
      expect(json.vatGel).toBe(4896);
    });

    it('10. Calculate RHD Gasoline customs', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'right'
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(43066);
      expect(json.exciseGel).toBe(9000);
      expect(json.vatGel).toBe(6516);
    });
  });

  describe('Tier 1 - Feature 3: Import Calculator (/api/calculate/import)', () => {
    it('11. Calculate import with manual fees', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'manual',
        feesUsd: 600,
        inlandUsd: 800,
        oceanUsd: 1200,
        insuranceUsd: 100,
        portUsd: 200,
        repairsUsd: 500
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(46555.92);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(6757.92);

      const buyLine = json.lines.find((l: any) => l.label === "აუქციონზე შეძენა");
      expect(buyLine.amountGel).toBe(27200);
      const feesLine = json.lines.find((l: any) => l.label === "Copart-ის საკომისიოები");
      expect(feesLine.amountGel).toBe(1632);
      const repairsLine = json.lines.find((l: any) => l.label === "სავარაუდო შეკეთება");
      expect(repairsLine.amountGel).toBe(1360);
    });

    it('12. Calculate import with auto Copart fees', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'auto',
        inlandUsd: 800,
        oceanUsd: 1200,
        insuranceUsd: 100,
        portUsd: 200,
        repairsUsd: 0
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(47330.3);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(7083.5);
    });

    it('13. Calculate import with repairs cost', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'manual',
        feesUsd: 600,
        inlandUsd: 800,
        oceanUsd: 1200,
        insuranceUsd: 100,
        portUsd: 200,
        repairsUsd: 1500
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(49275.92);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(6757.92);
    });

    it('14. Calculate import with zero transport costs', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'manual',
        feesUsd: 0,
        inlandUsd: 0,
        oceanUsd: 0,
        insuranceUsd: 0,
        portUsd: 0,
        repairsUsd: 0
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(35986);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(5436);
    });

    it('15. Calculate import with custom parameters', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 5000,
        year: 2018,
        engineCc: 1800,
        powertrain: "hybrid",
        steering: "left",
        feesMode: "manual",
        feesUsd: 500,
        inlandUsd: 700,
        oceanUsd: 1100,
        insuranceUsd: 120,
        portUsd: 250,
        repairsUsd: 800
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(32756.03);
      expect(json.exciseGel).toBe(4860);
      expect(json.vatGel).toBe(4507.63);
    });
  });

  describe('Tier 2 - Boundary & Corner Cases', () => {
    it('16. Compare invalid Copart URL', async () => {
      const res = await callApi(compareHandler, {
        copartUrl: "invalid-url",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 5000
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("მიუთითეთ ვალიდური Copart/IAAI ბმული ან 17-ნიშნა VIN კოდი");
    });

    it('17. Compare invalid MyAuto URL', async () => {
      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "invalid-url",
        expectedPriceUsd: 5000
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid URL");
    });

    it('18. Compare listing fetch failure (no expected price)', async () => {
      vi.mocked(fetchCopart).mockResolvedValue(null as any);
      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789"
      });
      expect(res.status).toBe(502);
      const json = await res.json();
      expect(json.error).toBe("Copart-ის მიმდინარე ბიდი ვერ მოიძებნა. შეავსეთ სავალდებულო ველი „მოსალოდნელი მოგების ფასი (USD)“ და სცადეთ ხელახლა.");
    });

    it('19. Compare MyAuto listing fetch failure', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        price: 8000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });
      vi.mocked(fetchMyAuto).mockRejectedValue(new Error("autopapa.ge-ს მონაცემები ვერ მოიძებნა"));
      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 5000
      });
      expect(res.status).toBe(502);
      const json = await res.json();
      expect(json.error).toContain("autopapa.ge-ს მონაცემები ვერ მოიძებნა");
    });

    it('20. Compare invalid JSON format', async () => {
      const res = await callApi(compareHandler, "invalid-json-body-content");
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("მოთხოვნის ფორმატი არასწორია");
    });

    it('21. Customs missing required fields', async () => {
      const res = await callApi(customsHandler, {
        year: 2020,
        engineCc: 2000
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("შეავსეთ ყველა სავალდებულო ველი");
    });

    it('22. Customs zero or negative purchaseUsd', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: -100,
        year: 2020,
        engineCc: 2000
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("შეავსეთ ყველა სავალდებულო ველი");
    });

    it('23. Customs zero or negative engineCc', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 5000,
        year: 2020,
        engineCc: -5
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("შეავსეთ ყველა სავალდებულო ველი");
    });

    it('24. Customs zero or negative year', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 5000,
        year: 0,
        engineCc: 2000
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("შეავსეთ ყველა სავალდებულო ველი");
    });

    it('25. Customs extreme engine capacity (100,000 cc)', async () => {
      const res = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 100000,
        powertrain: 'gasoline',
        steering: 'left'
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(209446);
      expect(json.exciseGel).toBe(150000);
      expect(json.vatGel).toBe(31896);
    });

    it('26. Import missing required fields', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 5000
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("შეავსეთ ყველა სავალდებულო ველი");
    });

    it('27. Import negative values for shipping/repairs', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'manual',
        feesUsd: -100,
        inlandUsd: -100,
        oceanUsd: -100,
        insuranceUsd: -100,
        portUsd: -100,
        repairsUsd: -100
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(35986);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(5436);
    });

    it('28. Import extreme purchase price (1,000,000 USD)', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 1000000,
        year: 2020,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'auto',
        inlandUsd: 800,
        oceanUsd: 1200,
        insuranceUsd: 100,
        portUsd: 200,
        repairsUsd: 0
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(3462424.94);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(528030.14);
    });

    it('29. Import extremely old vehicle (e.g. 1900)', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 5000,
        year: 1900,
        engineCc: 3000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'manual',
        feesUsd: 500,
        inlandUsd: 800,
        oceanUsd: 1200,
        insuranceUsd: 100,
        portUsd: 200,
        repairsUsd: 0
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(41216.96);
      expect(json.exciseGel).toBe(13500);
      expect(json.vatGel).toBe(6150.96);
    });

    it('30. Import extremely young vehicle (future year 2027)', async () => {
      const res = await callApi(importHandler, {
        purchaseUsd: 10000,
        year: 2027,
        engineCc: 2000,
        powertrain: 'gasoline',
        steering: 'left',
        feesMode: 'manual',
        feesUsd: 500,
        inlandUsd: 800,
        oceanUsd: 1200,
        insuranceUsd: 100,
        portUsd: 200,
        repairsUsd: 0
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalGel).toBe(44874.96);
      expect(json.exciseGel).toBe(3000);
      expect(json.vatGel).toBe(6708.96);
    });
  });

  describe('Tier 3 - Cross-Feature Combinations', () => {
    it('31. Cross-Feature: Customs vs Import calculations consistency', async () => {
      const bodyParams = {
        purchaseUsd: 8000,
        year: 2020,
        engineCc: 2500,
        powertrain: 'gasoline',
        steering: 'left'
      };

      const resCustoms = await callApi(customsHandler, bodyParams);
      const resImport = await callApi(importHandler, {
        ...bodyParams,
        feesMode: 'manual',
        feesUsd: 0,
        inlandUsd: 0,
        oceanUsd: 0,
        insuranceUsd: 0,
        portUsd: 0,
        repairsUsd: 0
      });

      expect(resCustoms.status).toBe(200);
      expect(resImport.status).toBe(200);

      const jsonCustoms = await resCustoms.json();
      const jsonImport = await resImport.json();

      expect(jsonCustoms.exciseGel).toBe(3750);
      expect(jsonImport.exciseGel).toBe(3750);

      expect(jsonCustoms.vatGel).toBe(4591.80);
      expect(jsonImport.vatGel).toBe(4591.80);

      expect(jsonCustoms.totalGel).toBe(30451.80);
      expect(jsonImport.totalGel).toBe(30451.80);
    });

    it('32. Cross-Feature: Compare import lines consistency with Import Calculator', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        price: 8000,
        currency: "USD",
        stateCode: "TX",
        location: "Houston, TX",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2020 Toyota Camry",
        year: 2020,
        make: "Toyota",
        model: "Camry",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        price: 18000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const resCompare = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 8000,
        repairsUsd: 0
      });

      expect(resCompare.status).toBe(200);
      const jsonCompare = await resCompare.json();

      expect(jsonCompare.importTotalGel).toBe(42405.11);

      const resImport = await callApi(importHandler, {
        purchaseUsd: 8000,
        year: 2020,
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        feesMode: "manual",
        feesUsd: 1220,
        inlandUsd: 850,
        oceanUsd: 1250,
        insuranceUsd: 150,
        portUsd: 300,
        repairsUsd: 0
      });

      expect(resImport.status).toBe(200);
      const jsonImport = await resImport.json();

      expect(jsonImport.totalGel).toBe(jsonCompare.importTotalGel);
      expect(jsonImport.exciseGel).toBe(3750);
      expect(jsonImport.vatGel).toBe(6290.71);
    });

    it('33. Cross-Feature: Exchange Rate scaling consistency', async () => {

      vi.mocked(getUsdGelRate).mockResolvedValue({ rate: 2.50, source: "ეროვნული ბანკი (NBG)" });
      const resRate1 = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left"
      });
      expect(resRate1.status).toBe(200);
      const jsonRate1 = await resRate1.json();
      expect(jsonRate1.totalGel).toBe(33390);
      expect(jsonRate1.exciseGel).toBe(3000);
      expect(jsonRate1.vatGel).toBe(5040);

      vi.mocked(getUsdGelRate).mockResolvedValue({ rate: 3.00, source: "ეროვნული ბანკი (NBG)" });
      const resRate2 = await callApi(customsHandler, {
        purchaseUsd: 10000,
        year: 2020,
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left"
      });
      expect(resRate2.status).toBe(200);
      const jsonRate2 = await resRate2.json();
      expect(jsonRate2.totalGel).toBe(39290);
      expect(jsonRate2.exciseGel).toBe(3000);
      expect(jsonRate2.vatGel).toBe(5940);

      const cifGel1 = (jsonRate1.vatGel / 0.18) - jsonRate1.exciseGel;
      const cifGel2 = (jsonRate2.vatGel / 0.18) - jsonRate2.exciseGel;
      expect(cifGel2 / cifGel1).toBeCloseTo(3.00 / 2.50, 5);
      expect(jsonRate1.exciseGel).toBe(3000);
      expect(jsonRate2.exciseGel).toBe(3000);
    });
  });

  describe('Tier 4 - Real-World Application Scenarios', () => {
    it('34. Scenario 1: Salvage car import with repairs vs local cleared car', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2020 Toyota RAV4 LHD",
        year: 2020,
        make: "Toyota",
        model: "RAV4",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        price: 3000,
        currency: "USD",
        stateCode: "TX",
        location: "Houston, TX",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2020 Toyota RAV4 LHD",
        year: 2020,
        make: "Toyota",
        model: "RAV4",
        engineCc: 2500,
        powertrain: "gasoline",
        steering: "left",
        price: 16000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 3000,
        repairsUsd: 2000
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(30368.84);
      expect(json.localTotalGel).toBe(43520);
      expect(json.differenceGel).toBe(13151.16);
      expect(json.savingsPercent).toBe(30.2);
      expect(json.roiPercent).toBe(43.3);
      expect(json.verdict).toBe("import");
    });

    it('35. Scenario 2: High-end SUV import vs local uncleared RHD hybrid', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2022 Porsche Cayenne LHD",
        year: 2022,
        make: "Porsche",
        model: "Cayenne",
        engineCc: 3000,
        powertrain: "gasoline",
        steering: "left",
        price: 30000,
        currency: "USD",
        stateCode: "NY",
        location: "New York, NY",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2022 Porsche Cayenne RHD",
        year: 2022,
        make: "Porsche",
        model: "Cayenne",
        engineCc: 3000,
        powertrain: "hybrid",
        steering: "right",
        price: 25000,
        currency: "USD",
        customsPassed: false,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 30000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(118137.98);
      expect(json.localTotalGel).toBe(90148);
      expect(json.differenceGel).toBe(27989.98);
      expect(json.verdict).toBe("local");
      expect(json.warnings).toContain("ნაპოვნი autopapa.ge-ს ავტომობილი განუბაჟებელია - ადგილობრივ ფასს დაემატა სავარაუდო განბაჟება.");
    });

    it('36. Scenario 3: New Electric Car import', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2026 Tesla Model 3 LHD Electric",
        year: 2026,
        make: "Tesla",
        model: "Model 3",
        engineCc: 0,
        powertrain: "electric",
        steering: "left",
        price: 40000,
        currency: "USD",
        stateCode: "CA",
        location: "Los Angeles, CA",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2026 Tesla Model 3 LHD Electric",
        year: 2026,
        make: "Tesla",
        model: "Model 3",
        engineCc: 0,
        powertrain: "electric",
        steering: "left",
        price: 48000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 40000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(147331.18);
      expect(json.localTotalGel).toBe(130560);
      expect(json.differenceGel).toBe(16771.18);
      expect(json.verdict).toBe("local");
    });

    it('37. Scenario 4: UK RHD diesel vs local LHD gasoline', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "2018 BMW 320d RHD Diesel",
        year: 2018,
        make: "BMW",
        model: "320d",
        engineCc: 2000,
        powertrain: "diesel",
        steering: "right",
        price: 5000,
        currency: "USD",
        stateCode: "UK",
        location: "London, UK",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "2018 BMW 320i LHD Gasoline",
        year: 2018,
        make: "BMW",
        model: "320i",
        engineCc: 2000,
        powertrain: "gasoline",
        steering: "left",
        price: 15000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 5000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(59537.30);
      expect(json.localTotalGel).toBe(40800);
      expect(json.verdict).toBe("local");
    });

    it('38. Scenario 5: Classic vintage car import', async () => {
      vi.mocked(fetchCopart).mockResolvedValue({
        provider: "copart",
        externalId: "12345678",
        title: "1985 Ford Mustang LHD Gasoline",
        year: 1985,
        make: "Ford",
        model: "Mustang",
        engineCc: 5000,
        powertrain: "gasoline",
        steering: "left",
        price: 12000,
        currency: "USD",
        stateCode: "MI",
        location: "Detroit, MI",
        sourceUrl: "https://www.copart.com/lot/12345678",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      vi.mocked(fetchMyAuto).mockResolvedValue({
        provider: "myauto",
        externalId: "456789",
        title: "1985 Ford Mustang LHD Gasoline",
        year: 1985,
        make: "Ford",
        model: "Mustang",
        engineCc: 5000,
        powertrain: "gasoline",
        steering: "left",
        price: 25000,
        currency: "USD",
        customsPassed: true,
        sourceUrl: "https://www.myauto.ge/ka/pr/456789",
        fetchedAt: "2026-07-13T18:42:30Z"
      });

      const res = await callApi(compareHandler, {
        copartUrl: "https://www.copart.com/lot/12345678",
        myautoUrl: "https://www.myauto.ge/ka/pr/456789",
        expectedPriceUsd: 12000,
        repairsUsd: 0
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.importTotalGel).toBe(77689.47);
      expect(json.localTotalGel).toBe(68000);
      expect(json.verdict).toBe("local");
    });
  });

  describe('AI Comparison Analysis Endpoint (/api/compare/analyze)', () => {
    it('AI Analysis Endpoint returns success when called with correct payload', async () => {
      const originalKey = process.env.MIMO_API_KEY;
      process.env.MIMO_API_KEY = "test-key";
      const originalFetch = global.fetch;

      const mockResult = {
        verdict: "import",
        title: "იმპორტი ჯობია",
        summary: "ფინანსური დანაზოგი დიდია",
        scores: {
          financialScoreImport: 85,
          financialScoreLocal: 40,
          riskScoreImport: 60,
          riskScoreLocal: 20,
          reliabilityScoreImport: 40,
          reliabilityScoreLocal: 90
        },
        specs: [],
        advantages: {
          importPros: ["იაფია"],
          importCons: [],
          localPros: [],
          localCons: []
        },
        details: {
          financialAnalysis: "დეტალური ანალიზი",
          riskAssessment: "",
          expertRecommendation: ""
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(mockResult) } }]
        })
      } as any);

      const res = await callApi(analyzeHandler, {
        copart: { title: "2020 Toyota Camry", year: 2020, engineCc: 2500, powertrain: "gasoline", steering: "left", price: 8000, currency: "USD", location: "TX", sourceUrl: "https://www.copart.com/lot/123", fetchedAt: "2026-07-13" },
        myauto: { title: "2020 Toyota Camry", year: 2020, engineCc: 2500, powertrain: "gasoline", steering: "left", price: 18000, currency: "USD", customsPassed: true, sourceUrl: "https://www.myauto.ge/ka/pr/456", fetchedAt: "2026-07-13" },
        exchangeRate: 2.72,
        differenceGel: 6554.89,
        savingsPercent: 13.4,
        roiPercent: 15.5,
        verdict: "import",
        importTotalGel: 42405.11,
        localTotalGel: 48960
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.analysis.title).toBe("იმპორტი ჯობია");
      expect(json.analysis.scores.financialScoreImport).toBe(85);
      global.fetch = originalFetch;
      process.env.MIMO_API_KEY = originalKey;
    });

    it('AI Analysis Endpoint returns error when missing parameters', async () => {
      const originalKey = process.env.MIMO_API_KEY;
      process.env.MIMO_API_KEY = "test-key";
      const res = await callApi(analyzeHandler, {});
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
      process.env.MIMO_API_KEY = originalKey;
    });
  });

  describe('AI Chatbot Endpoint (/api/compare/chat)', () => {
    it('Chatbot Endpoint returns success and response message', async () => {
      const originalKey = process.env.MIMO_API_KEY;
      process.env.MIMO_API_KEY = "test-key";
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "რა თქმა უნდა, ეს ჰიბრიდია." } }]
        })
      } as any);

      const res = await callApi(chatHandler, {
        messages: [{ role: "user", content: "ადგილობრივი მანქანა ჰიბრიდია?" }],
        comparison: {
          copart: { title: "2020 Toyota Camry", year: 2020, engineCc: 2500, powertrain: "gasoline", steering: "left", price: 8000, currency: "USD", location: "TX", sourceUrl: "https://www.copart.com/lot/123", fetchedAt: "2026-07-13" },
          myauto: { title: "2020 Toyota Camry Hybrid", year: 2020, engineCc: 2500, powertrain: "hybrid", steering: "left", price: 18000, currency: "USD", customsPassed: true, sourceUrl: "https://www.myauto.ge/ka/pr/456", fetchedAt: "2026-07-13" },
          exchangeRate: 2.72,
          differenceGel: 6554.89,
          savingsPercent: 13.4,
          roiPercent: 15.5,
          verdict: "import",
          importTotalGel: 42405.11,
          localTotalGel: 48960
        }
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.reply).toBe("რა თქმა უნდა, ეს ჰიბრიდია.");
      global.fetch = originalFetch;
      process.env.MIMO_API_KEY = originalKey;
    });

    it('Chatbot Endpoint returns error when missing parameters', async () => {
      const originalKey = process.env.MIMO_API_KEY;
      process.env.MIMO_API_KEY = "test-key";
      const res = await callApi(chatHandler, {});
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
      process.env.MIMO_API_KEY = originalKey;
    });

    it('Chatbot Endpoint caps message history to last 10 turns', async () => {
      const originalKey = process.env.MIMO_API_KEY;
      process.env.MIMO_API_KEY = "test-key";
      const originalFetch = global.fetch;
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "პასუხი" } }]
        })
      } as any);
      global.fetch = fetchMock;

      const comparison = {
        copart: { title: "2020 Toyota Camry", year: 2020, engineCc: 2500, powertrain: "gasoline", steering: "left", price: 8000, currency: "USD", location: "TX", sourceUrl: "https://www.copart.com/lot/123", fetchedAt: "2026-07-13" },
        myauto: { title: "2020 Toyota Camry Hybrid", year: 2020, engineCc: 2500, powertrain: "hybrid", steering: "left", price: 18000, currency: "USD", customsPassed: true, sourceUrl: "https://www.myauto.ge/ka/pr/456", fetchedAt: "2026-07-13" },
        exchangeRate: 2.72,
        differenceGel: 6554.89,
        savingsPercent: 13.4,
        roiPercent: 15.5,
        verdict: "import",
        importTotalGel: 42405.11,
        localTotalGel: 48960
      };

      const messages = Array.from({ length: 25 }, (_, index) => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: `message-${index}`
      }));

      const res = await callApi(chatHandler, { messages, comparison });
      expect(res.status).toBe(200);

      const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1]?.body as string);
      const conversationMessages = body.messages.filter((message: { role: string }) => message.role !== "system");
      expect(conversationMessages.length).toBe(20);
      expect(conversationMessages[0].content).toBe("message-5");

      global.fetch = originalFetch;
      process.env.MIMO_API_KEY = originalKey;
    });

    it('Chatbot Endpoint returns 429 when rate limit exceeded', async () => {
      const originalKey = process.env.MIMO_API_KEY;
      process.env.MIMO_API_KEY = "test-key";
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "ok" } }]
        })
      } as any);

      const payload = {
        messages: [{ role: "user", content: "test" }],
        comparison: {
          copart: { title: "A", year: 2020, engineCc: 2000, powertrain: "gasoline", steering: "left", price: 1, currency: "USD", location: "TX", sourceUrl: "https://www.copart.com/lot/1", fetchedAt: "2026-07-13" },
          myauto: { title: "B", year: 2020, engineCc: 2000, powertrain: "gasoline", steering: "left", price: 1, currency: "USD", customsPassed: true, sourceUrl: "https://www.myauto.ge/ka/pr/2", fetchedAt: "2026-07-13" },
          exchangeRate: 2.7,
          differenceGel: 100,
          savingsPercent: 1,
          roiPercent: 1,
          verdict: "import",
          importTotalGel: 1000,
          localTotalGel: 1100
        }
      };

      const requestInit = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "chat-rate-limit-test-ip"
        },
        body: JSON.stringify(payload)
      } as RequestInit;

      for (let i = 0; i < 20; i++) {
        const res = await chatHandler(new Request("http://localhost/api/compare/chat", requestInit));
        expect(res.status).toBe(200);
      }

      const blocked = await chatHandler(new Request("http://localhost/api/compare/chat", requestInit));
      expect(blocked.status).toBe(429);

      global.fetch = originalFetch;
      process.env.MIMO_API_KEY = originalKey;
    });
  });
});
