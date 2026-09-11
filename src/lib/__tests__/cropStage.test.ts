import { describe, it, expect } from "vitest";
import {
  getDueCropStageRules,
  buildCropTimeline,
  type CropStageRuleLike,
} from "@/lib/cropStage";

const RULES: CropStageRuleLike[] = [
  {
    id: "r1",
    name: "Emergence Check",
    description: "Check emergence.",
    daysAfterPlanting: 10,
    priority: 2,
    notificationMessage: "Check emergence now.",
  },
  {
    id: "r2",
    name: "Earthing Up",
    description: "First earthing up.",
    daysAfterPlanting: 25,
    priority: 4,
    notificationMessage: "Earth up your crop now.",
  },
  {
    id: "r3",
    name: "Harvest Prep",
    description: "Prepare for harvest.",
    daysAfterPlanting: 95,
    priority: 4,
    notificationMessage: "Start planning your harvest.",
  },
];

describe("getDueCropStageRules", () => {
  it("returns no rules before planting day", () => {
    const planting = new Date("2026-01-01");
    const due = getDueCropStageRules(planting, RULES, new Set(), new Date("2025-12-31"));
    expect(due).toEqual([]);
  });

  it("returns only rules whose day has arrived", () => {
    const planting = new Date("2026-01-01");
    const now = new Date("2026-01-15"); // 14 days in
    const due = getDueCropStageRules(planting, RULES, new Set(), now);
    expect(due.map((r) => r.id)).toEqual(["r1"]);
  });

  it("excludes rules already sent", () => {
    const planting = new Date("2026-01-01");
    const now = new Date("2026-01-15");
    const due = getDueCropStageRules(planting, RULES, new Set(["r1"]), now);
    expect(due).toEqual([]);
  });
});

describe("buildCropTimeline", () => {
  it("computes calendar dates and orders by days after planting", () => {
    const planting = new Date("2026-01-01T00:00:00.000Z");
    const timeline = buildCropTimeline(planting, [...RULES].reverse(), new Date("2026-01-01"));
    expect(timeline.map((t) => t.id)).toEqual(["r1", "r2", "r3"]);
    expect(timeline[1].targetDate.toISOString().slice(0, 10)).toBe("2026-01-26");
  });

  it("marks a stage as current within the +/-3 day window", () => {
    const planting = new Date("2026-01-01");
    const now = new Date("2026-01-11"); // day 10 -> matches r1 exactly
    const timeline = buildCropTimeline(planting, RULES, now);
    const r1 = timeline.find((t) => t.id === "r1")!;
    expect(r1.status).toBe("current");
  });

  it("marks earlier stages as past and later ones as upcoming", () => {
    const planting = new Date("2026-01-01");
    const now = new Date("2026-01-26"); // day 25 -> matches r2
    const timeline = buildCropTimeline(planting, RULES, now);
    expect(timeline.find((t) => t.id === "r1")!.status).toBe("past");
    expect(timeline.find((t) => t.id === "r2")!.status).toBe("current");
    expect(timeline.find((t) => t.id === "r3")!.status).toBe("upcoming");
  });

  it("computes weeksAfterPlanting for display", () => {
    const planting = new Date("2026-01-01");
    const timeline = buildCropTimeline(planting, RULES, planting);
    const r2 = timeline.find((t) => t.id === "r2")!;
    expect(r2.weeksAfterPlanting).toBeCloseTo(3.6, 1);
  });
});
