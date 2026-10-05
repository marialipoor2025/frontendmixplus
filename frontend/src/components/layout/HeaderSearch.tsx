"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CameraIcon, SearchIcon } from "@/components/layout/icons";
import { siteConfig } from "@/config/site";

type HeaderSearchProps = {
  /** Prefix before brand: «جستجو در» */
  prefix?: string;
  brandName?: string;
  /** Desktop Barghchi pill shape; same hint text as mobile */
  variant?: "default" | "barghchi";
};

/**
 * Search field — same «جستجو در میکس پلاس» hint on mobile + desktop.
 * Submits to `/search?q=...`.
 */
export function HeaderSearch({
  prefix = "جستجو در",
  brandName = siteConfig.nameFa,
  variant = "default",
}: HeaderSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const showHint = !value && !focused;
  const isBarghchi = variant === "barghchi";
  const inputId = isBarghchi ? "site-search-desktop" : "site-search";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const hint = showHint ? (
    <span
      className="pointer-events-none absolute inset-0 flex items-center gap-1 text-sm font-medium"
      aria-hidden
    >
      <span className="text-[var(--color-neutral-500)]">{prefix}</span>
      <span
        className="bg-clip-text font-extrabold text-transparent"
        style={{
          backgroundImage: "linear-gradient(135deg, #1672dd 0%, #ed1944 100%)",
        }}
      >
        {brandName}
      </span>
    </span>
  ) : null;

  if (isBarghchi) {
    return (
      <div className="relative min-w-0 flex-1">
        <label className="sr-only" htmlFor={inputId}>
          {prefix} {brandName}
        </label>
        <form
          className="relative flex w-full items-center"
          onSubmit={onSubmit}
        >
          <div className="relative flex w-full items-center rounded-2xl bg-[var(--color-neutral-100)] py-3 pe-5 ps-14">
            <span className="pointer-events-none absolute start-5 flex items-center border-e border-[var(--color-neutral-300)] pe-2.5 text-[#707EAE]">
              <SearchIcon />
            </span>
            <div className="relative min-w-0 grow">
              {hint}
              <input
                id={inputId}
                name="q"
                type="text"
                autoComplete="off"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="h-6 w-full min-w-0 bg-transparent text-sm font-medium text-[var(--color-neutral-700)] outline-none"
              />
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <label className="sr-only" htmlFor={inputId}>
        {prefix} {brandName}
      </label>
      <form
        className="flex h-11 min-w-0 w-full max-w-[600px] flex-1 items-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-3 md:w-[500px] md:px-4"
        onSubmit={onSubmit}
      >
        <div className="relative flex min-w-0 grow items-center gap-2">
          <SearchIcon className="shrink-0 text-[#707EAE]" />

          <div className="relative min-w-0 grow">
            {hint}
            <input
              id={inputId}
              name="q"
              type="search"
              autoComplete="off"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="h-10 w-full min-w-0 bg-transparent text-sm font-medium text-[var(--color-neutral-700)] outline-none [&::-webkit-search-cancel-button]:hidden"
            />
          </div>

          <button
            type="button"
            aria-label="جستجو با تصویر"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#7c5cff] transition hover:bg-white/70"
          >
            <CameraIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
