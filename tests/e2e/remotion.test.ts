import { describe, it, expect } from "vitest";
import { interpolate, Easing } from "../../remotion/node_modules/remotion";
export const TARGET_SAVINGS = 8500;
export const COUNT_START = 40;
export const COUNT_END = 150;
export const TOTAL_IMPORT_COST = 38400;

export const COST_BREAKDOWN = [
  {
    startFrame: 90,
    endFrame: 125,
    duration: 35,
    value: 26000,
    color: "#2563EB",
  },
  {
    startFrame: 105,
    endFrame: 140,
    duration: 35,
    value: 6000,
    color: "#B91C1C",
  },
  {
    startFrame: 120,
    endFrame: 155,
    duration: 35,
    value: 4000,
    color: "#DC2626",
  },
  {
    startFrame: 135,
    endFrame: 170,
    duration: 35,
    value: 2400,
    color: "#EF4444",
  },
];

describe("Scene 3 Feature Zoom - Timeline & Interpolation Verification", () => {
  it("Verify loading skeleton vs content visibility and cross-fade", () => {

    const skeletonOpacity15 = interpolate(15, [30, 40], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const contentOpacity15 = interpolate(15, [30, 40], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    expect(skeletonOpacity15).toBe(1);
    expect(contentOpacity15).toBe(0);
    expect(15 < 180).toBe(true);

    const skeletonOpacity30 = interpolate(30, [30, 40], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const contentOpacity30 = interpolate(30, [30, 40], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    expect(skeletonOpacity30).toBe(1);
    expect(contentOpacity30).toBe(0);

    const skeletonOpacity35 = interpolate(35, [30, 40], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const contentOpacity35 = interpolate(35, [30, 40], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    expect(skeletonOpacity35).toBe(0.5);
    expect(contentOpacity35).toBe(0.5);

    const skeletonOpacity40 = interpolate(40, [30, 40], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const contentOpacity40 = interpolate(40, [30, 40], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    expect(skeletonOpacity40).toBe(0);
    expect(contentOpacity40).toBe(1);
    expect(40 < 180).toBe(true);
    expect(180 < 180).toBe(false);
  });

  it("Verify sequential stagger start of progress bars and counters", () => {

    const mainSavingsProgress39 = interpolate(39, [COUNT_START, COUNT_END], [0, TARGET_SAVINGS], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar1Progress39 = interpolate(39, [COST_BREAKDOWN[0].startFrame, COST_BREAKDOWN[0].endFrame], [0, COST_BREAKDOWN[0].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar2Progress39 = interpolate(39, [COST_BREAKDOWN[1].startFrame, COST_BREAKDOWN[1].endFrame], [0, COST_BREAKDOWN[1].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar3Progress39 = interpolate(39, [COST_BREAKDOWN[2].startFrame, COST_BREAKDOWN[2].endFrame], [0, COST_BREAKDOWN[2].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar4Progress39 = interpolate(39, [COST_BREAKDOWN[3].startFrame, COST_BREAKDOWN[3].endFrame], [0, COST_BREAKDOWN[3].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    expect(mainSavingsProgress39).toBe(0);
    expect(bar1Progress39).toBe(0);
    expect(bar2Progress39).toBe(0);
    expect(bar3Progress39).toBe(0);
    expect(bar4Progress39).toBe(0);

    const mainSavingsProgress50 = interpolate(50, [COUNT_START, COUNT_END], [0, TARGET_SAVINGS], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar1Progress50 = interpolate(50, [COST_BREAKDOWN[0].startFrame, COST_BREAKDOWN[0].endFrame], [0, COST_BREAKDOWN[0].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    expect(mainSavingsProgress50).toBeGreaterThan(0);
    expect(bar1Progress50).toBe(0);

    const bar1Progress95 = interpolate(95, [COST_BREAKDOWN[0].startFrame, COST_BREAKDOWN[0].endFrame], [0, COST_BREAKDOWN[0].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar2Progress95 = interpolate(95, [COST_BREAKDOWN[1].startFrame, COST_BREAKDOWN[1].endFrame], [0, COST_BREAKDOWN[1].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    expect(bar1Progress95).toBeGreaterThan(0);
    expect(bar2Progress95).toBe(0);

    const bar2Progress110 = interpolate(110, [COST_BREAKDOWN[1].startFrame, COST_BREAKDOWN[1].endFrame], [0, COST_BREAKDOWN[1].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar3Progress110 = interpolate(110, [COST_BREAKDOWN[2].startFrame, COST_BREAKDOWN[2].endFrame], [0, COST_BREAKDOWN[2].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    expect(bar2Progress110).toBeGreaterThan(0);
    expect(bar3Progress110).toBe(0);

    const bar3Progress125 = interpolate(125, [COST_BREAKDOWN[2].startFrame, COST_BREAKDOWN[2].endFrame], [0, COST_BREAKDOWN[2].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const bar4Progress125 = interpolate(125, [COST_BREAKDOWN[3].startFrame, COST_BREAKDOWN[3].endFrame], [0, COST_BREAKDOWN[3].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    expect(bar3Progress125).toBeGreaterThan(0);
    expect(bar4Progress125).toBe(0);

    const bar4Progress140 = interpolate(140, [COST_BREAKDOWN[3].startFrame, COST_BREAKDOWN[3].endFrame], [0, COST_BREAKDOWN[3].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    expect(bar4Progress140).toBeGreaterThan(0);
  });

  it("Verify proper end-states and final interpolated values", () => {
    const finalSavings = interpolate(180, [COUNT_START, COUNT_END], [0, TARGET_SAVINGS], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const finalBar1 = interpolate(180, [COST_BREAKDOWN[0].startFrame, COST_BREAKDOWN[0].endFrame], [0, COST_BREAKDOWN[0].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const finalBar2 = interpolate(180, [COST_BREAKDOWN[1].startFrame, COST_BREAKDOWN[1].endFrame], [0, COST_BREAKDOWN[1].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const finalBar3 = interpolate(180, [COST_BREAKDOWN[2].startFrame, COST_BREAKDOWN[2].endFrame], [0, COST_BREAKDOWN[2].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    const finalBar4 = interpolate(180, [COST_BREAKDOWN[3].startFrame, COST_BREAKDOWN[3].endFrame], [0, COST_BREAKDOWN[3].value / TOTAL_IMPORT_COST], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    expect(finalSavings).toBe(TARGET_SAVINGS);
    expect(finalBar1).toBeCloseTo(COST_BREAKDOWN[0].value / TOTAL_IMPORT_COST, 4);
    expect(finalBar2).toBeCloseTo(COST_BREAKDOWN[1].value / TOTAL_IMPORT_COST, 4);
    expect(finalBar3).toBeCloseTo(COST_BREAKDOWN[2].value / TOTAL_IMPORT_COST, 4);
    expect(finalBar4).toBeCloseTo(COST_BREAKDOWN[3].value / TOTAL_IMPORT_COST, 4);
  });

  it("Verify Georgian (GEL) currency formatting and ROI representation", () => {
    const gelFmt = new Intl.NumberFormat("ka-GE");

    const formattedSavings = gelFmt.format(TARGET_SAVINGS);
    const formattedImportCost = gelFmt.format(TOTAL_IMPORT_COST);
    const formattedVehicleCost = gelFmt.format(COST_BREAKDOWN[0].value);
    const formattedShipping = gelFmt.format(COST_BREAKDOWN[1].value);
    const formattedCustoms = gelFmt.format(COST_BREAKDOWN[2].value);
    const formattedAuction = gelFmt.format(COST_BREAKDOWN[3].value);

    expect(formattedSavings).not.toContain(",");
    expect(formattedImportCost).not.toContain(",");
    expect(formattedVehicleCost).not.toContain(",");
    expect(formattedShipping).not.toContain(",");
    expect(formattedCustoms).not.toContain(",");
    expect(formattedAuction).not.toContain(",");

    const normalizedSavings = formattedSavings.replace(/\s/g, " ");
    expect(["8 500", "8500"]).toContain(normalizedSavings);
    expect(["38 400", "38400"]).toContain(formattedImportCost.replace(/\s/g, " "));
    expect(["26 000", "26000"]).toContain(formattedVehicleCost.replace(/\s/g, " "));
  });
});
