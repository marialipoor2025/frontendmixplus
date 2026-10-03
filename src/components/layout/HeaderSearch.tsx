"use client";

import { useEffect, useRef } from "react";
import { SearchIcon } from "@/components/layout/icons";

type HeaderSearchProps = {
  placeholder?: string;
};

/**
 * Digikala-style desktop search pill (rounded, gray surface, Ctrl+K hint).
 * Opens focus on Ctrl/Cmd+K; full search modal can plug in later.
 */
export function HeaderSearch({
  placeholder = "جستجو",
}: HeaderSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isModK =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (!isModK) return;
      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-w-0 flex-1">
      <label className="sr-only" htmlFor="site-search">
        {placeholder}
      </label>
      <div className="flex h-11 min-w-0 w-full max-w-[600px] flex-1 items-center rounded-full bg-[var(--color-neutral-100)] px-4 md:w-[500px]">
        <div className="flex min-w-0 grow items-center justify-between gap-2">
          <SearchIcon className="text-[var(--color-icon-low-emphasis)]" />
          <input
            ref={inputRef}
            id="site-search"
            name="search-input"
            type="search"
            autoComplete="off"
            placeholder={placeholder}
            className="h-10 min-w-0 grow bg-transparent px-2 text-sm font-medium text-[var(--color-neutral-500)] outline-none placeholder:text-[var(--color-neutral-500)]"
          />
          <kbd
            className="pointer-events-none hidden shrink-0 rounded border border-[var(--color-neutral-200)] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-neutral-400)] sm:inline-block"
            aria-hidden="true"
          >
            Ctrl+K
          </kbd>
        </div>
      </div>
    </div>
  );
}
