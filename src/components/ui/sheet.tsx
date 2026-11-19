"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType | null>(null);

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleOpenChange]);

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: SheetContentProps) {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("SheetContent must be used within Sheet");
  }

  const { open, onOpenChange } = context;

  if (!open) return null;

  const sideClasses = {
    top: "top-0 inset-x-0 border-b animate-in slide-in-from-top",
    bottom: "bottom-0 inset-x-0 border-t animate-in slide-in-from-bottom",
    left: "left-0 inset-y-0 border-r animate-in slide-in-from-left",
    right: "right-0 inset-y-0 border-l animate-in slide-in-from-right",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet Content Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 h-full bg-card shadow-2xl transition ease-in-out duration-300",
          sideClasses[side],
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
