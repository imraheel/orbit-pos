import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-50 dark:focus:ring-offset-slate-900",
        {
          "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100/80": variant === "default",
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-800/80": variant === "secondary",
          "border-transparent bg-red-600 text-white hover:bg-red-600/80 dark:bg-red-700 dark:hover:bg-red-700/80": variant === "destructive",
          "text-slate-950 dark:text-slate-50": variant === "outline",
          "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-900 dark:text-emerald-100 dark:hover:bg-emerald-900/80": variant === "success",
          "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100/80 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-900/80": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
