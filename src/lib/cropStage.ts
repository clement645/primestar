// Crop-stage reminder engine (section 64). Rules live in the database
// (CropStageRule) so admins can tune them without a code change; this
// module just contains the pure "which rules are due" logic.

export interface CropStageRuleLike {
  id: string;
  daysAfterPlanting: number;
  notificationMessage: string;
  name: string;
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
