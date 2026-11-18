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
    default: "bg-[#4A9099] text-white border-transparent",
    teal: "bg-[#EBF4F5] text-[#4A9099] border-[#4A9099]/30 font-semibold",
    orange: "bg-[#FFF2EB] text-[#FF6B00] border-[#FF6B00]/40 font-semibold",
    gold: "bg-[#FFF2EB] text-[#FF6B00] border-[#FF6B00]/40 font-semibold", // Backward compatibility alias
    secondary: "bg-[#F9F8F6] text-[#1E293B] border-[#E8E5DF]",
    outline: "border-[#E8E5DF] text-[#64748B] bg-transparent",
    leather: "bg-[#EBF4F5] text-[#3D7A82] border-[#4A9099]/30 font-medium",
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
