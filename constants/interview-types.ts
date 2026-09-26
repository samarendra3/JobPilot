export const INTERVIEW_TYPES = [
  "HR",
  "TECHNICAL",
  "MANAGERIAL",
  "FINAL",
  "OTHER",
] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  HR: "HR",
  TECHNICAL: "Technical",
  MANAGERIAL: "Managerial",
  FINAL: "Final",
  OTHER: "Other",
};
