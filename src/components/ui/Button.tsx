import * as React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            // Primary - with glow effect in dark mode
            "bg-blue-600 text-white hover:bg-blue-700 shadow-sm": variant === "primary",
            "dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-lg dark:shadow-blue-500/20": variant === "primary",
            
            // Secondary
            "bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary",
            "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700": variant === "secondary",
            
            // Ghost
            "bg-transparent hover:bg-slate-100 text-slate-700": variant === "ghost",
            "dark:hover:bg-slate-800 dark:text-slate-300": variant === "ghost",
            
            // Outline
            "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm": variant === "outline",
            "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800": variant === "outline",
            
            // Destructive - with glow effect in dark mode
            "bg-red-600 text-white hover:bg-red-700 shadow-sm": variant === "destructive",
            "dark:bg-red-600 dark:hover:bg-red-500 dark:shadow-lg dark:shadow-red-500/20": variant === "destructive",
            
            // Sizes
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
