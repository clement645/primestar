// Crop-stage reminder engine (section 64). Rules live in the database
// (CropStageRule) so admins can tune them without a code change; this
// module just contains the pure "which rules are due" logic.

export interface CropStageRuleLike {
  id: string;
  daysAfterPlanting: number;
  notificationMessage: string;
  name: string;
  description: string;
  priority: number;
}

/**
 * Given a planting date and the set of active rules, return the rules whose
 * trigger day has arrived (days since planting >= rule.daysAfterPlanting),
 * excluding any rule id already present in `alreadySentRuleIds` so the same
 * milestone is never notified twice for the same farmer.
 */
export function getDueCropStageRules(
  plantingDate: Date,
  rules: CropStageRuleLike[],
  alreadySentRuleIds: Set<string>,
  now: Date = new Date()
): CropStageRuleLike[] {
  const daysSincePlanting = Math.floor(
    (now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSincePlanting < 0) return [];

  return rules
    .filter(
      (rule) =>
        rule.daysAfterPlanting <= daysSincePlanting &&
        !alreadySentRuleIds.has(rule.id)
    )
    .sort((a, b) => b.priority - a.priority);
}

export type CropStageStatus = "past" | "current" | "upcoming";

export interface CropTimelineEntry extends CropStageRuleLike {
  targetDate: Date;
  status: CropStageStatus;
  weeksAfterPlanting: number;
}

/**
 * Build the full forward-looking crop care plan for a planting date — every
 * active stage from planting through harvest prep, each with its computed
 * calendar date and status, not just the ones currently due. This is what
 * a farmer sees immediately after entering a planting date, so they know
 * everything ahead ("earthing up in 3-4 weeks", "fungicide window around
 * week 5", etc.), not only the reminders that have already fired.
 * "current" means the stage's window is within +/- 3 days of today, giving
 * a visible "you are here" marker on the timeline.
 */
export function buildCropTimeline(
  plantingDate: Date,
  rules: CropStageRuleLike[],
  now: Date = new Date()
): CropTimelineEntry[] {
  const daysSincePlanting = Math.floor(
    (now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const CURRENT_WINDOW_DAYS = 3;

  return [...rules]
    .sort((a, b) => a.daysAfterPlanting - b.daysAfterPlanting)
    .map((rule) => {
      const targetDate = new Date(plantingDate);
      targetDate.setDate(targetDate.getDate() + rule.daysAfterPlanting);

      const diff = rule.daysAfterPlanting - daysSincePlanting;
      let status: CropStageStatus;
      if (diff > CURRENT_WINDOW_DAYS) status = "upcoming";
      else if (diff < -CURRENT_WINDOW_DAYS) status = "past";
      else status = "current";

      return {
        ...rule,
        targetDate,
        status,
        weeksAfterPlanting: Math.round((rule.daysAfterPlanting / 7) * 10) / 10,
      };
    });
}
