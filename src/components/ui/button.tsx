import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default:
        "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-[0.98]",
      secondary:
        "bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98]",
      outline:
        "border border-slate-700 text-slate-200 hover:bg-slate-800/60 active:scale-[0.98]",
      ghost:
        "text-slate-300 hover:bg-slate-800 hover:text-white",
      danger:
        "bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-4 py-2 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-lg",
      icon: "h-10 w-10 p-2 rounded-lg flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
