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
        "bg-[#4A9099] text-white hover:bg-[#3D7A82] shadow-md shadow-[#4A9099]/20 active:scale-[0.98] border border-transparent",
      teal:
        "bg-[#4A9099] text-white hover:bg-[#3D7A82] shadow-md shadow-[#4A9099]/20 active:scale-[0.98] border border-transparent",
      orange:
        "bg-[#FF6B00] text-white font-semibold hover:bg-[#E66000] shadow-md shadow-[#FF6B00]/25 active:scale-[0.98] border border-transparent",
      gold:
        "bg-[#FF6B00] text-white font-semibold hover:bg-[#E66000] shadow-md shadow-[#FF6B00]/25 active:scale-[0.98] border border-transparent",
      secondary:
        "bg-[#F9F8F6] text-[#1E293B] hover:bg-[#EFECE6] border border-[#E8E5DF] active:scale-[0.98]",
      outline:
        "border border-[#4A9099] text-[#4A9099] hover:bg-[#4A9099] hover:text-white active:scale-[0.98]",
      orangeOutline:
        "border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white active:scale-[0.98]",
      ghost:
        "text-[#1E293B] hover:bg-[#EBF4F5] hover:text-[#4A9099]",
    };

    const sizes = {
      sm: "h-8 px-3.5 text-xs rounded-lg",
      md: "h-10 px-5 py-2 text-sm rounded-xl",
      lg: "h-12 px-7 text-base rounded-xl",
      icon: "h-10 w-10 p-2 rounded-xl flex items-center justify-center",
    };

    const combinedClassName = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
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
