"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNavChatIcon } from "@/components/layout/icons";
import { MobileSupportChat } from "@/components/layout/MobileSupportChat";

export const OPEN_SUPPORT_CHAT_EVENT = "oriya:open-support-chat";

/**
 * Floating chat FAB (desktop only) with ping ring.
 * Opens the same support panel used on mobile.
 */
export function DesktopSupportChat() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_SUPPORT_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SUPPORT_CHAT_EVENT, onOpen);
  }, []);

  if (
    pathname.startsWith("/users") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller")
  ) {
    return null;
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-7 right-7 z-30 hidden size-16 items-center justify-center lg:flex"
          aria-label="گفتگو با کارشناسان"
          aria-expanded={false}
        >
          <span
            className="animate-slowPing absolute inset-0 z-0 rounded-full bg-[#00BAD140]"
            aria-hidden
          />
          <span className="relative z-10 flex size-14 items-center justify-center rounded-full bg-[#00BAD1] text-white shadow-md transition hover:brightness-105">
            <BottomNavChatIcon className="h-7 w-7 text-white" />
          </span>
        </button>
      ) : null}

      <MobileSupportChat open={open} onClose={() => setOpen(false)} />
    </>
  );
}
