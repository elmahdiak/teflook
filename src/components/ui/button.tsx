import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "teal"
    | "orange"
    | "gold"
    | "secondary"
    | "outline"
    | "orangeOutline"
    | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, children, ...props }, ref) => {
    const variants = {
      default:
        "bg-[#1A3C34] text-white hover:bg-[#132E27] shadow-md shadow-[#1A3C34]/20 active:scale-[0.98] border border-transparent",
      teal:
        "bg-[#1A3C34] text-white hover:bg-[#132E27] shadow-md shadow-[#1A3C34]/20 active:scale-[0.98] border border-transparent",
      orange:
        "bg-[#C85A32] text-white font-semibold hover:bg-[#B24E2A] shadow-md shadow-[#C85A32]/25 active:scale-[0.98] border border-transparent",
      gold:
        "bg-[#E6A15C] text-[#1A2825] font-semibold hover:bg-[#D7924A] shadow-md shadow-[#E6A15C]/25 active:scale-[0.98] border border-transparent",
      secondary:
        "bg-[#F9F8F6] text-[#1A2825] hover:bg-[#F2EFEB] border border-[#E5E1D8] active:scale-[0.98]",
      outline:
        "border border-[#1A3C34] text-[#1A3C34] hover:bg-[#1A3C34] hover:text-white active:scale-[0.98]",
      orangeOutline:
        "border border-[#C85A32] text-[#C85A32] hover:bg-[#C85A32] hover:text-white active:scale-[0.98]",
      ghost:
        "text-[#1A2825] hover:bg-[#EDF3F1] hover:text-[#1A3C34]",
    };

    const sizes = {
      sm: "h-8 px-3.5 text-xs rounded-lg",
      md: "h-10 px-5 py-2 text-sm rounded-xl",
      lg: "h-12 px-7 text-base rounded-xl",
      icon: "h-10 w-10 p-2 rounded-xl flex items-center justify-center",
    };

    const combinedClassName = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C85A32] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      variants[variant] || variants.default,
      sizes[size] || sizes.md,
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(combinedClassName, (children as any).props?.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
