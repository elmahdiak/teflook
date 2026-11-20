import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "teal"
    | "orange"
    | "gold"
    | "outline"
    | "leather"
    | "success";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[#4C9A9C] text-white border-transparent",
    teal: "bg-[#EBF5F5] text-[#4C9A9C] border-[#4C9A9C]/30 font-semibold",
    orange: "bg-[#FDF2EE] text-[#FE7C58] border-[#FE7C58]/40 font-semibold",
    gold: "bg-[#FEF8EC] text-[#FEC748] border-[#FEC748]/40 font-semibold",
    secondary: "bg-[#FBF9F5] text-[#1C2A2B] border-[#E6E1D8]",
    outline: "border-[#E6E1D8] text-[#5C6F70] bg-transparent",
    leather: "bg-[#EBF5F5] text-[#2C6466] border-[#4C9A9C]/30 font-medium",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
