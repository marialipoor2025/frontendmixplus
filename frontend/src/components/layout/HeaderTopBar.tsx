import { BottomNavChatIcon } from "@/components/layout/icons";

const SUPPORT_HOURS = "از ساعت ۹ تا ۱۷ در روزهای کاری پاسخگوی شما هستیم";
const SUPPORT_PHONE = "۰۲۱-۶۱۹۳۰۰۰۰";
const SUPPORT_PHONE_TEL = "+982161930000";
/**
 * Top utility strip (desktop only) — white, same as the search row.
 */
export function HeaderTopBar() {
  return (
    <div className="hidden w-full bg-[var(--color-neutral-000)] lg:block">
      <div className="site-container flex items-center justify-between gap-4 py-2.5 text-xs text-[var(--color-neutral-600)]">
        <p className="flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            className="shrink-0 text-[var(--color-neutral-500)]"
            aria-hidden
          >
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              d="M12 7v5l3 2"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <span>{SUPPORT_HOURS}</span>
        </p>

        <div className="flex items-center gap-5">
          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="flex items-center gap-1.5 transition hover:text-[var(--color-neutral-800)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              className="shrink-0"
              aria-hidden
            >
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
              />
            </svg>
            <span dir="ltr">{SUPPORT_PHONE}</span>
          </a>

          <a
            href="/page/contact-us"
            className="flex items-center gap-1.5 transition hover:text-[var(--color-neutral-800)]"
          >
            <BottomNavChatIcon className="h-3.5 w-3.5" />
            <span>گفتگو با کارشناسان</span>
          </a>
        </div>
      </div>
    </div>
  );
}
