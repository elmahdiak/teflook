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
    default: "bg-[#1A3C34] text-white border-transparent",
    teal: "bg-[#EDF3F1] text-[#1A3C34] border-[#1A3C34]/30 font-semibold",
    orange: "bg-[#FBF1EC] text-[#C85A32] border-[#C85A32]/40 font-semibold",
    gold: "bg-[#FDF6ED] text-[#E6A15C] border-[#E6A15C]/40 font-semibold",
    secondary: "bg-[#F9F8F6] text-[#1A2825] border-[#E5E1D8]",
    outline: "border-[#E5E1D8] text-[#5E6D68] bg-transparent",
    leather: "bg-[#EDF3F1] text-[#132E27] border-[#1A3C34]/30 font-medium",
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
