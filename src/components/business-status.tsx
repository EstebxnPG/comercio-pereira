import { STATUS_DESCRIPTIONS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BusinessStatus } from "@/types/business";

const statusStyles: Record<BusinessStatus, string> = {
  open: "border-emerald-200 bg-emerald-50 text-emerald-800",
  partial_service: "border-amber-200 bg-amber-50 text-amber-800",
  relocated: "border-sky-200 bg-sky-50 text-sky-800",
  delivery_only: "border-violet-200 bg-violet-50 text-violet-800",
  temporarily_closed: "border-stone-200 bg-stone-100 text-stone-700",
};

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-sm font-semibold",
        statusStyles[status],
      )}
      title={STATUS_DESCRIPTIONS[status]}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
