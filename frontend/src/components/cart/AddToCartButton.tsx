"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCartItem } from "@/lib/api/cart";
import { useAuth } from "@/lib/auth/useAuth";
import type { AddCartItemInput } from "@/types/cart";

type Props = {
  input: AddCartItemInput;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  label?: string;
  disabledLabel?: string;
  testId?: string;
};

/**
 * Shared ATC control: auth gate → POST /api/cart/items → toast/navigate.
 */
export function AddToCartButton({
  input,
  disabled = false,
  className = "",
  wrapperClassName = "w-full",
  label = "افزودن به سبد خرید",
  disabledLabel = "ناموجود",
  testId = "add-to-cart",
}: Props) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (disabled || pending) return;
    if (!ready) return;

    if (!isAuthenticated) {
      const returnUrl = `/product/${encodeURIComponent(input.productSlug)}`;
      router.push(
        `/users/login?returnUrl=${encodeURIComponent(returnUrl)}`,
      );
      return;
    }

    setPending(true);
    setMessage(null);
    try {
      await addCartItem(input);
      setMessage("به سبد اضافه شد");
      router.push("/checkout/cart");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "افزودن به سبد ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        data-testid={testId}
        disabled={disabled || pending}
        onClick={() => void handleClick()}
        className={className}
      >
        {disabled ? disabledLabel : pending ? "در حال افزودن…" : label}
      </button>
      {message ? (
        <p className="mt-1 text-[11px] text-[var(--color-neutral-600)]">{message}</p>
      ) : null}
    </div>
  );
}
