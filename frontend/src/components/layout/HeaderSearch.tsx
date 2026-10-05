"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState, type FormEvent } from "react";
import { CameraIcon, SearchIcon } from "@/components/layout/icons";
import { siteConfig } from "@/config/site";
import {
  getSearchSuggestions,
  type SearchSuggestion,
} from "@/lib/search-suggest";

type HeaderSearchProps = {
  /** Prefix before brand: «جستجو در» */
  prefix?: string;
  brandName?: string;
  /** Desktop Barghchi pill shape; same hint text as mobile */
  variant?: "default" | "barghchi";
};

/**
 * Search field with autocomplete suggestions.
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
  const deferred = useDeferredValue(value);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const showHint = !value && !focused;
  const isBarghchi = variant === "barghchi";
  const inputId = isBarghchi ? "site-search-desktop" : "site-search";
  const showSuggestions = focused && suggestions.length > 0;

  useEffect(() => {
    setSuggestions(getSearchSuggestions(deferred));
  }, [deferred]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    setFocused(false);
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

  const suggestionList = showSuggestions ? (
    <ul
      className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white py-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)]"
      role="listbox"
    >
      {suggestions.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setFocused(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)]"
          >
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                item.kind === "brand"
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : item.kind === "query"
                    ? "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"
                    : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]"
              }`}
            >
              {item.kind === "brand"
                ? "برند"
                : item.kind === "query"
                  ? "جستجو"
                  : "کالا"}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
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
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls={`${inputId}-list`}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="h-6 w-full min-w-0 bg-transparent text-sm font-medium text-[var(--color-neutral-700)] outline-none"
              />
            </div>
          </div>
          <div id={`${inputId}-list`}>{suggestionList}</div>
        </form>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 flex-1">
      <label className="sr-only" htmlFor={inputId}>
        {prefix} {brandName}
      </label>
      <form
        className="relative flex h-11 min-w-0 w-full max-w-[600px] flex-1 items-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-3 md:w-[500px] md:px-4"
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
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls={`${inputId}-list`}
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
        <div id={`${inputId}-list`} className="absolute inset-x-0 top-full">
          {suggestionList}
        </div>
      </form>
    </div>
  );
}
