"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { NavMenuIcon } from "@/components/layout/NavMenuIcon";
import { NAV_ACTION_LINKS } from "@/components/layout/navMenuShared";

const GRADIENT = "linear-gradient(135deg, #1672dd 0%, #ed1944 100%)";

type HeaderQuickLinksProps = {
  /** Desktop: compact row in MainNav. Mobile: full-width under search. */
  variant?: "mobile" | "desktop";
};

function ButtonLabel({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 leading-tight">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

/**
 * Quick-access action buttons.
 * Only «فروشنده شو» uses the filled gradient; hover scales all buttons up.
 */
export function HeaderQuickLinks({ variant = "mobile" }: HeaderQuickLinksProps) {
  const isDesktop = variant === "desktop";
  const hoverGrow =
    "origin-center transition-transform duration-200 ease-out hover:z-10 hover:scale-110";

  return (
    <div
      className={
        isDesktop
          ? "flex shrink-0 items-center gap-2"
          : "mt-2 grid grid-cols-3 gap-2 lg:hidden"
      }
      role="tablist"
      aria-label="دسترسی سریع"
    >
      {NAV_ACTION_LINKS.map(({ id, href, title, icon }) => {
        const isSeller = id === "seller";

        if (isSeller) {
          return (
            <Link
              key={id}
              href={href}
              role="tab"
              aria-selected
              className={
                isDesktop
                  ? `inline-flex h-10 min-w-[8.5rem] items-center justify-center rounded-xl px-3 text-center text-[13px] font-medium text-white shadow-sm ${hoverGrow}`
                  : `inline-flex min-h-9 items-center justify-center rounded-lg px-1.5 text-center text-[11px] font-medium text-white shadow-sm ${hoverGrow}`
              }
              style={{ backgroundImage: GRADIENT }}
            >
              <ButtonLabel
                label={title}
                icon={<NavMenuIcon name={icon} className="h-4 w-4 text-white" />}
              />
            </Link>
          );
        }

        return (
          <Link
            key={id}
            href={href}
            role="tab"
            aria-selected={false}
            className={
              isDesktop
                ? `inline-flex h-10 min-w-[8.5rem] items-center justify-center rounded-xl p-px text-center text-[13px] font-medium ${hoverGrow}`
                : `inline-flex min-h-9 items-center justify-center rounded-lg p-px text-center text-[11px] font-medium ${hoverGrow}`
            }
            style={{ backgroundImage: GRADIENT }}
          >
            <span
              className={
                isDesktop
                  ? "flex h-full w-full items-center justify-center rounded-[11px] bg-white px-3 text-[var(--color-neutral-700)]"
                  : "flex h-full min-h-[34px] w-full items-center justify-center rounded-[7px] bg-white px-1 text-[var(--color-neutral-700)]"
              }
            >
              <ButtonLabel
                label={title}
                icon={
                  <NavMenuIcon
                    name={icon}
                    className="h-4 w-4 text-[var(--color-icon-secondary)]"
                  />
                }
              />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
