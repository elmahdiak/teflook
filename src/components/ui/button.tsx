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
        "bg-[#4C9A9C] text-white hover:bg-[#3E8688] shadow-md shadow-[#4C9A9C]/20 active:scale-[0.98] border border-transparent",
      teal:
        "bg-[#4C9A9C] text-white hover:bg-[#3E8688] shadow-md shadow-[#4C9A9C]/20 active:scale-[0.98] border border-transparent",
      orange:
        "bg-[#FE7C58] text-white font-semibold hover:bg-[#E96843] shadow-md shadow-[#FE7C58]/25 active:scale-[0.98] border border-transparent",
      gold:
        "bg-[#FEC748] text-[#1C2A2B] font-semibold hover:bg-[#EDB330] shadow-md shadow-[#FEC748]/25 active:scale-[0.98] border border-transparent",
      secondary:
        "bg-[#FBF9F5] text-[#1C2A2B] hover:bg-[#F3EFE9] border border-[#E6E1D8] active:scale-[0.98]",
      outline:
        "border border-[#4C9A9C] text-[#4C9A9C] hover:bg-[#4C9A9C] hover:text-white active:scale-[0.98]",
      orangeOutline:
        "border border-[#FE7C58] text-[#FE7C58] hover:bg-[#FE7C58] hover:text-white active:scale-[0.98]",
      ghost:
        "text-[#1C2A2B] hover:bg-[#EBF5F5] hover:text-[#4C9A9C]",
    };

    const sizes = {
      sm: "h-8 px-3.5 text-xs rounded-lg",
      md: "h-10 px-5 py-2 text-sm rounded-xl",
      lg: "h-12 px-7 text-base rounded-xl",
      icon: "h-10 w-10 p-2 rounded-xl flex items-center justify-center",
    };

    const combinedClassName = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE7C58] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
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
