"use client";

import { useState } from "react";
import {
  EmptyState,
  GradientFrame,
  ProfileButton,
  ProfileCard,
  ProfileShell,
} from "@/components/profile/ProfileShell";
import { formatIrt, mockGiftCards, type GiftCard } from "@/lib/mocks/profile";

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>(mockGiftCards);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function redeem() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("کد کارت هدیه را وارد کنید");
      return;
    }
    if (cards.some((c) => c.code === trimmed)) {
      setError("این کارت قبلاً اضافه شده است");
      return;
    }
    setCards((list) => [
      {
        id: `g-${Date.now()}`,
        code: trimmed,
        balance: 500_000,
        expiresAt: "1404/12/29",
        status: "active",
      },
      ...list,
    ]);
    setCode("");
    setError(null);
  }

  return (
    <ProfileShell title="کارت هدیه">
      <ProfileCard className="mb-4">
        <h2 className="mb-3 text-sm font-bold">ثبت کارت هدیه</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <GradientFrame radius="rounded-lg" className="min-w-0 flex-1">
            <input
              value={code}
              dir="ltr"
              placeholder="مثلاً GIFT-MIX-1234"
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              className="w-full rounded-[7px] bg-white px-3 py-2.5 text-sm outline-none"
            />
          </GradientFrame>
          <ProfileButton type="button" onClick={redeem}>
            افزودن
          </ProfileButton>
        </div>
        {error ? <p className="mt-2 text-xs text-[var(--color-hint-object-error)]">{error}</p> : null}
      </ProfileCard>

      {cards.length === 0 ? (
        <EmptyState message="کارت هدیه‌ای ندارید." />
      ) : (
        <ul className="space-y-3">
          {cards.map((card) => (
            <li key={card.id}>
              <ProfileCard>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold" dir="ltr">
                      {card.code}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      انقضا: {card.expiresAt} ·{" "}
                      {card.status === "active"
                        ? "فعال"
                        : card.status === "used"
                          ? "مصرف‌شده"
                          : "منقضی"}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatIrt(card.balance)}</p>
                </div>
              </ProfileCard>
            </li>
          ))}
        </ul>
      )}
    </ProfileShell>
  );
}
