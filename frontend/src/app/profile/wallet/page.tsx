"use client";

import { useState } from "react";
import {
  GradientFrame,
  ProfileButton,
  ProfileCard,
  ProfileShell,
} from "@/components/profile/ProfileShell";
import { formatIrt, mockWallet, type WalletTx } from "@/lib/mocks/profile";

const TOPUP_OPTIONS = [100_000, 200_000, 500_000, 1_000_000];

export default function WalletPage() {
  const [balance, setBalance] = useState(mockWallet.balance);
  const [txs, setTxs] = useState<WalletTx[]>(mockWallet.transactions);
  const [selected, setSelected] = useState(TOPUP_OPTIONS[1]);
  const [message, setMessage] = useState<string | null>(null);

  function topUp() {
    setBalance((b) => b + selected);
    setTxs((list) => [
      {
        id: `w-${Date.now()}`,
        title: "شارژ کیف پول (آزمایشی)",
        amount: selected,
        createdAt: "همین الان",
        type: "credit",
      },
      ...list,
    ]);
    setMessage(`موجودی ${formatIrt(selected)} افزایش یافت.`);
  }

  return (
    <ProfileShell title="کیف پول">
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <ProfileCard>
          <p className="text-xs text-[var(--color-muted)]">موجودی فعلی</p>
          <p className="mt-2 text-lg font-bold">{formatIrt(balance)}</p>
        </ProfileCard>
        <ProfileCard>
          <p className="mb-3 text-sm font-bold">افزایش موجودی</p>
          <div className="flex flex-wrap gap-2">
            {TOPUP_OPTIONS.map((amount) => (
              <GradientFrame key={amount} radius="rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelected(amount)}
                  className={[
                    "rounded-[7px] px-3 py-1.5 text-xs font-medium",
                    selected === amount
                      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                      : "bg-white text-[var(--color-neutral-800)]",
                  ].join(" ")}
                >
                  {formatIrt(amount)}
                </button>
              </GradientFrame>
            ))}
          </div>
          <ProfileButton type="button" onClick={topUp} className="mt-3">
            شارژ آزمایشی
          </ProfileButton>
          {message ? (
            <p className="mt-2 text-xs font-medium text-[var(--color-success)]">{message}</p>
          ) : null}
        </ProfileCard>
      </div>

      <ProfileCard>
        <h2 className="mb-3 text-sm font-bold">تراکنش‌ها</h2>
        <ul className="divide-y divide-[var(--color-neutral-100)]">
          {txs.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">{tx.title}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">{tx.createdAt}</p>
              </div>
              <p
                className={
                  tx.type === "credit"
                    ? "font-bold text-[var(--color-success)]"
                    : "font-bold text-[var(--color-primary)]"
                }
              >
                {tx.type === "credit" ? "+" : "-"}
                {formatIrt(tx.amount)}
              </p>
            </li>
          ))}
        </ul>
      </ProfileCard>
    </ProfileShell>
  );
}
