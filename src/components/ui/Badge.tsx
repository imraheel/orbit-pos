import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        {
          // Default
          "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80": variant === "default",
          "dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100/80": variant === "default",
          
          // Secondary
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80": variant === "secondary",
          "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700": variant === "secondary",
          
          // Destructive
          "border-transparent bg-red-600 text-white hover:bg-red-600/80": variant === "destructive",
          "dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/30": variant === "destructive",
          
          // Outline
          "text-slate-950 border-slate-200": variant === "outline",
          "dark:text-slate-100 dark:border-slate-700": variant === "outline",
          
          // Success - Vibrant dark mode
          "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80": variant === "success",
          "dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/30": variant === "success",
          
          // Warning - Vibrant dark mode
          "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100/80": variant === "warning",
          "dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 dark:hover:bg-amber-500/30": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
