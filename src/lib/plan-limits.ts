export type PlanId = "free" | "student" | "professional" | "enterprise";

export const PLAN_LIMITS: Record<PlanId, { analysesPerMonth: number; storageMb: number }> = {
  free: { analysesPerMonth: 5, storageMb: 50 },
  student: { analysesPerMonth: 50, storageMb: 200 },
  professional: { analysesPerMonth: 500, storageMb: 2048 },
  enterprise: { analysesPerMonth: Infinity, storageMb: Infinity },
};

export function getPlanLimit(plan: string | null | undefined) {
  const key = (plan ?? "free") as PlanId;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.free;
}
