"use client";

import React, { useEffect, useRef } from "react";
import { Delete, Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ARABIC_KEY_ROWS: string[][] = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"],
];

const ARABIC_EXTRA_KEYS = ["أ", "إ", "آ", "،"];

export interface ArabicVirtualKeyboardProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (nextValue: string) => void;
  onClose: () => void;
  className?: string;
}

export function ArabicVirtualKeyboard({
  inputRef,
  value,
  onChange,
  onClose,
  className,
}: ArabicVirtualKeyboardProps) {
  function applyEdit(compute: (current: string, start: number, end: number) => {
    nextValue: string;
    nextCursor: number;
  }) {
    const el = inputRef.current;
    const current = el ? el.value : value;
    const start =
      el && typeof el.selectionStart === "number"
        ? el.selectionStart
        : current.length;
    const end =
      el && typeof el.selectionEnd === "number"
        ? el.selectionEnd
        : current.length;

    const { nextValue, nextCursor } = compute(current, start, end);
    onChange(nextValue);

    requestAnimationFrame(() => {
      const target = inputRef.current;
      if (!target) return;
      target.focus({ preventScroll: true });
      try {
        target.setSelectionRange(nextCursor, nextCursor);
      } catch {}
    });
  }

  function handleInsert(text: string) {
    applyEdit((current, start, end) => ({
      nextValue: current.slice(0, start) + text + current.slice(end),
      nextCursor: start + text.length,
    }));
  }

  function handleBackspace() {
    applyEdit((current, start, end) => {
      if (start !== end) {
        return {
          nextValue: current.slice(0, start) + current.slice(end),
          nextCursor: start,
        };
      }
      if (start <= 0) {
        return { nextValue: current, nextCursor: 0 };
      }
      return {
        nextValue: current.slice(0, start - 1) + current.slice(end),
        nextCursor: start - 1,
      };
    });
  }

  return (
    <div
      dir="rtl"
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "rounded-2xl border border-[#4B9393]/25 bg-[#F3EFE6] p-2.5 sm:p-3 shadow-xl select-none",
        className
      )}
    >
      {/* Keyboard Header */}
      <div
        dir="ltr"
        className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#4B9393]/15"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1A3C34]">
          <span className="grid size-5 place-items-center rounded-md bg-[#4B9393]/15 text-[#4B9393]">
            <Keyboard size={12} />
          </span>
          <span>Clavier Arabe</span>
          <span className="text-[#4B9393]">•</span>
          <span className="text-[#1A3C34]/75">لوحة المفاتيح</span>
        </div>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
          aria-label="Fermer le clavier arabe"
          title="Fermer"
          className="grid size-6 place-items-center rounded-lg bg-white/80 border border-[#4B9393]/20 text-[#1A3C34]/70 hover:bg-[#F67D56] hover:text-white hover:border-[#F67D56] transition-colors cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>

      {/* Arabic Letter Rows */}
      <div className="space-y-1.5">
        {ARABIC_KEY_ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-center gap-1"
          >
            {row.map((char) => (
              <button
                key={char}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsert(char)}
                className="flex-1 min-w-[21px] h-8 sm:h-9 rounded-lg border border-[#4B9393]/20 bg-white text-xs sm:text-sm font-bold text-[#1A3C34] shadow-2xs hover:bg-[#4B9393] hover:text-white hover:border-[#4B9393] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                {char}
              </button>
            ))}
          </div>
        ))}

        {/* Extra Hamza/Punctuation + Space + Backspace Row */}
        <div className="flex items-center justify-center gap-1 pt-0.5">
          {ARABIC_EXTRA_KEYS.map((char) => (
            <button
              key={char}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleInsert(char)}
              className="w-8 sm:w-9 h-8 sm:h-9 shrink-0 rounded-lg border border-[#4B9393]/20 bg-white/90 text-xs sm:text-sm font-bold text-[#4B9393] hover:bg-[#4B9393] hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              {char}
            </button>
          ))}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleInsert(" ")}
            className="flex-1 h-8 sm:h-9 rounded-lg border border-[#4B9393]/25 bg-white text-xs font-bold text-[#1A3C34] shadow-2xs hover:bg-[#4B9393] hover:text-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
          >
            مسافة
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleBackspace}
            aria-label="Effacer (Backspace)"
            title="Effacer"
            className="px-2.5 sm:px-3 h-8 sm:h-9 shrink-0 rounded-lg border border-[#F67D56]/30 bg-[#F67D56]/10 text-xs font-bold text-[#F67D56] hover:bg-[#F67D56] hover:text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <Delete size={14} />
            <span aria-hidden="true">⌫</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ArabicInputWithKeyboardProps {
  keyboardId: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
  value: string;
  onChange: (nextValue: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  inputClassName?: string;
}

export function ArabicInputWithKeyboard({
  keyboardId,
  isOpen,
  onToggle,
  onClose,
  value,
  onChange,
  onBlur,
  placeholder,
  inputClassName,
}: ArabicInputWithKeyboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  function handleToggleClick() {
    const opening = !isOpen;
    onToggle(keyboardId);
    if (opening) {
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        const alreadyFocused = document.activeElement === el;
        el.focus({ preventScroll: true });
        if (!alreadyFocused) {
          try {
            const len = el.value.length;
            el.setSelectionRange(len, len);
          } catch {}
        }
      });
    } else {
      onBlur?.();
    }
  }

  function handleCloseFromKeyboard() {
    onClose();
    onBlur?.();
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleClick}
          aria-expanded={isOpen}
          aria-label="Afficher le clavier arabe"
          title="Clavier arabe (لوحة المفاتيح)"
          className={cn(
            "absolute left-1.5 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-lg transition-colors cursor-pointer z-10",
            isOpen
              ? "bg-[#4B9393] text-white shadow-xs"
              : "text-[#4B9393]/80 hover:bg-[#4B9393]/10 hover:text-[#4B9393]"
          )}
        >
          <Keyboard size={15} />
        </button>

        <input
          ref={inputRef}
          type="text"
          dir="rtl"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(inputClassName, "pl-10 pr-3")}
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(calc(100vw-2.5rem),410px)] animate-in fade-in zoom-in-95 duration-150">
          <ArabicVirtualKeyboard
            inputRef={inputRef}
            value={value}
            onChange={onChange}
            onClose={handleCloseFromKeyboard}
          />
        </div>
      )}
    </div>
  );
}
