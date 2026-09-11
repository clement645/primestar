import type { CropTimelineEntry } from "@/lib/cropStage";

const STATUS_STYLES: Record<CropTimelineEntry["status"], string> = {
  past: "border-brand-lighter bg-white opacity-60",
  current: "border-brand-medium bg-brand-lighter/50 shadow-sm",
  upcoming: "border-brand-lighter bg-white",
};

const STATUS_BADGE: Record<CropTimelineEntry["status"], { label: string; className: string }> = {
  past: { label: "Done", className: "bg-brand-lighter text-brand-dark/60" },
  current: { label: "This Week", className: "bg-brand-medium text-white" },
  upcoming: { label: "Upcoming", className: "bg-brand-amber/20 text-brand-earth" },
};

export default function CropTimeline({ timeline }: { timeline: CropTimelineEntry[] }) {
  return (
    <div className="rounded-2xl border border-brand-lighter bg-white p-6">
      <h2 className="font-heading text-lg font-bold text-brand-dark">
        Your Potato Crop Care Timeline
      </h2>
      <p className="mt-1 text-sm text-brand-dark/60">
        A general guide based on your planting date — actual timing can vary
        with weather, variety and field conditions. Check your weather
        alerts and seek qualified agricultural advice for your specific
        situation.
      </p>

      <div className="mt-5 space-y-3">
        {timeline.map((stage) => {
          const badge = STATUS_BADGE[stage.status];
          return (
            <div
              key={stage.id}
              className={`rounded-xl border p-4 ${STATUS_STYLES[stage.status]}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-brand-dark">{stage.name}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-dark/50">
                Week {stage.weeksAfterPlanting} after planting &middot;{" "}
                {stage.targetDate.toLocaleDateString("en-KE", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="mt-2 text-sm text-brand-dark/75">{stage.notificationMessage}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
