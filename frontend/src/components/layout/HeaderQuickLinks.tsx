"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
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
  active,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 leading-tight">
      <span className={active ? "text-white" : "text-current"}>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

/**
 * Gradient action buttons with Barghchi-style icons.
 * فروشنده شو is the default active tab.
 */
export function HeaderQuickLinks({ variant = "mobile" }: HeaderQuickLinksProps) {
  const [activeId, setActiveId] = useState<(typeof NAV_ACTION_LINKS)[number]["id"]>(
    "seller",
  );

  const isDesktop = variant === "desktop";

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
        const active = id === activeId;

        if (active) {
          return (
            <Link
              key={id}
              href={href}
              role="tab"
              aria-selected
              onClick={() => setActiveId(id)}
              className={
                isDesktop
                  ? "inline-flex h-10 min-w-[8.5rem] items-center justify-center rounded-xl px-3 text-center text-[13px] font-medium text-white shadow-sm"
                  : "inline-flex min-h-9 items-center justify-center rounded-lg px-1.5 text-center text-[11px] font-medium text-white shadow-sm"
              }
              style={{ backgroundImage: GRADIENT }}
            >
              <ButtonLabel
                label={title}
                active
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
            onClick={() => setActiveId(id)}
            className={
              isDesktop
                ? "inline-flex h-10 min-w-[8.5rem] items-center justify-center rounded-xl p-px text-center text-[13px] font-medium"
                : "inline-flex min-h-9 items-center justify-center rounded-lg p-px text-center text-[11px] font-medium"
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
                active={false}
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
