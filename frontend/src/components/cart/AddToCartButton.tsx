"use client";

import { useCallback, useEffect, useState } from "react";
import { CartQtyStepper } from "@/components/cart/CartQtyStepper";
import {
  addCartItem,
  CART_CHANGED_EVENT,
  getCart,
  removeCartItem,
  updateCartItemQty,
} from "@/lib/api/cart";
import type { AddCartItemInput, CartLine } from "@/types/cart";

type Props = {
  input: AddCartItemInput;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  label?: string;
  disabledLabel?: string;
  testId?: string;
  /**
   * When true (default), stay on the current page after ATC and show qty stepper.
   * Set false only if a flow must navigate to the cart.
   */
  stayOnPage?: boolean;
};

function lineMatches(line: CartLine, input: AddCartItemInput) {
  const sku = (input.skuExternalKey?.trim() || "default").toLowerCase();
  return (
    line.productSlug === input.productSlug.trim().toLowerCase() &&
    line.offerExternalKey === input.offerExternalKey.trim() &&
    line.skuExternalKey.toLowerCase() === sku
  );
}

/**
 * ATC control: stays on PDP by default; after add shows inline qty editor.
 */
export function AddToCartButton({
  input,
  disabled = false,
  className = "",
  wrapperClassName = "w-full",
  label = "افزودن به سبد خرید",
  disabledLabel = "ناموجود",
  testId = "add-to-cart",
  stayOnPage = true,
}: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [line, setLine] = useState<CartLine | null>(null);

  const matchKey = [
    input.productSlug.trim().toLowerCase(),
    input.offerExternalKey.trim(),
    (input.skuExternalKey?.trim() || "default").toLowerCase(),
  ].join("|");

  const syncFromCart = useCallback(async () => {
    try {
      const cart = await getCart();
      const [slug, offer, sku] = matchKey.split("|");
      const match =
        cart?.items.find(
          (item) =>
            item.productSlug === slug &&
            item.offerExternalKey === offer &&
            item.skuExternalKey.toLowerCase() === sku,
        ) ?? null;
      setLine(match);
    } catch {
      // ignore — guest/network blips
    }
  }, [matchKey]);

  useEffect(() => {
    void syncFromCart();
    const onChange = () => void syncFromCart();
    window.addEventListener(CART_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CART_CHANGED_EVENT, onChange);
  }, [syncFromCart]);

  async function handleAdd() {
    if (disabled || pending) return;
    setPending(true);
    setMessage(null);
    try {
      const cart = await addCartItem({
        ...input,
        quantity: input.quantity ?? 1,
        stockAvailable: Math.max(input.stockAvailable ?? 0, 99),
      });
      const match =
        cart.items.find((item) => lineMatches(item, input)) ?? null;
      setLine(match);
      setMessage(stayOnPage ? "به سبد اضافه شد" : null);
      if (!stayOnPage && typeof window !== "undefined") {
        window.location.assign("/checkout/cart");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "افزودن به سبد ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  async function changeQty(next: number) {
    if (!line || pending) return;
    setPending(true);
    setMessage(null);
    try {
      if (next <= 0) {
        const cart = await removeCartItem(line.id);
        const match =
          cart.items.find((item) => lineMatches(item, input)) ?? null;
        setLine(match);
      } else {
        const cart = await updateCartItemQty(line.id, next);
        const match =
          cart.items.find((item) => lineMatches(item, input)) ?? null;
        setLine(match);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "به‌روزرسانی تعداد ناموفق بود");
      await syncFromCart();
    } finally {
      setPending(false);
    }
  }

  const maxQty = Math.max(line?.stockAvailable ?? 99, line?.quantity ?? 1, 99);

  if (line && line.quantity > 0) {
    return (
      <div className={wrapperClassName}>
        <div className="flex w-full flex-col items-stretch gap-1">
          <CartQtyStepper
            quantity={line.quantity}
            max={maxQty}
            disabled={pending || disabled}
            onDecrease={() => void changeQty(line.quantity - 1)}
            onIncrease={() => void changeQty(line.quantity + 1)}
            onSetQuantity={(qty) => void changeQty(qty)}
            className="h-12 w-full justify-between px-1"
            size="md"
          />
          {message ? (
            <p className="text-center text-[11px] text-[var(--color-neutral-600)]">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        data-testid={testId}
        disabled={disabled || pending}
        onClick={() => void handleAdd()}
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
