// Single source of truth for status badge colors.
// All status maps across the app reference these tokens — no raw Tailwind strings in status maps.
export const SC = {
  neutral: "bg-slate-500/15 text-slate-500 dark:text-slate-400",
  blue:    "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  sky:     "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  violet:  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  amber:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  yellow:  "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  orange:  "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  green:   "bg-green-500/15 text-green-600 dark:text-green-400",
  red:     "bg-red-500/15 text-red-600 dark:text-red-400",
  teal:    "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
} as const;

export type StatusColor = keyof typeof SC;
