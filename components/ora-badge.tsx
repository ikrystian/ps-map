import { cn } from "@/lib/utils";
import type { LawFirm } from "@/types";

const OraIcon = () => (
  <svg
    className="w-4 h-4 text-foreground"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeDasharray="1 1"
    />
    <path
      d="M12 7V17M9 17H15M8 10H16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 10.5C10 12 9 13.5 9 13.5M14 10.5C14 12 15 13.5 15 13.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

type ChamberFields = Pick<
  LawFirm,
  "oraStatus" | "oraMiasto" | "oirpStatus" | "oirpMiasto"
>;

export const getChamberText = (firm: ChamberFields) =>
  firm.oraStatus && firm.oraMiasto
    ? `ORA ${firm.oraMiasto}`
    : firm.oirpStatus && firm.oirpMiasto
      ? `OIRP ${firm.oirpMiasto}`
      : null;

// Badge izby (ORA/OIRP) — renderuje się tylko gdy ekspert ma wpis do izby
export function OraBadge({
  lawFirm,
  className,
}: {
  lawFirm: ChamberFields;
  className?: string;
}) {
  const chamberText = getChamberText(lawFirm);
  if (!chamberText) return null;

  return (
    <div
      className={cn(
        "ora-badge flex items-center gap-1  bg-[#172e2b] border border-[#0d5c54]/30 text-white pl-0.5 pr-0.5 md:pl-1 md:pr-1 py-0.5 md:py-1 rounded-[0.5rem_0_0_0.5rem] text-xs  font-medium transition-all duration-300 group-hover:border-[#0d5c54]/60",
        className,
      )}
    >
      <div className="bg-primary-dark p-1 md:p-0.5 rounded-md flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
        <OraIcon />
      </div>
      <span className="text-foreground">{chamberText}</span>
    </div>
  );
}
