export const LIMITS: {
  sites: number;
  services: number;
  servicesPerChapter: number;
  via: number;
  nameLength: number;
  operatorLength: number;
};
export function textProblem(s: unknown): string | null;
export function validateShowcase(input: unknown, opts?: { now?: Date }): { ok: boolean; errors: string[] };
