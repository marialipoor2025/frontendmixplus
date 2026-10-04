"use client";

import { useState } from "react";

const TABS = [
  { id: "intro", label: "معرفی" },
  { id: "review", label: "بررسی تخصصی" },
  { id: "specs", label: "مشخصات" },
  { id: "comments", label: "دیدگاه‌ها" },
  { id: "questions", label: "پرسش‌ها" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * Sticky PDP section menu — scrolls to matching content anchors.
 */
export function ProductScrollTabs() {
  const [activeId, setActiveId] = useState<TabId>("intro");

  function selectTab(id: TabId) {
    setActiveId(id);
    const target = document.getElementById(`pdp-${id}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="sticky top-[7rem] z-[2] mt-5 block w-full bg-[var(--color-neutral-000)] transition-[top] duration-200 ease-in-out lg:top-[8.25rem]">
      <ul className="hide-scrollbar relative flex w-full overflow-x-auto border-b border-[var(--color-neutral-200)]">
        {TABS.map((tab) => {
          const active = tab.id === activeId;
          return (
            <li
              key={tab.id}
              role="button"
              tabIndex={0}
              data-cro-id="pdp-scroll-menu"
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectTab(tab.id);
                }
              }}
              className={[
                "relative flex min-w-fit max-w-[300px] cursor-pointer flex-row items-center justify-center overflow-hidden px-4 py-2 text-[13px] font-semibold grow lg:max-w-[400px] lg:grow-0",
                active
                  ? "rounded-b-sm border-0 border-b-4 border-solid border-[var(--color-primary-500)] text-[var(--color-primary-500)]"
                  : "border-b-4 border-transparent text-[var(--color-neutral-500)]",
              ].join(" ")}
            >
              {tab.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
