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
import { addToWishlist } from "@/lib/api/wishlist";
import { formatFaNumber } from "@/lib/format";
import { useAuth } from "@/lib/auth/useAuth";
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

function maxStockMessage(max: number) {
  return `حداکثر موجودی قابل سفارش ${formatFaNumber(max)} عدد`;
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
  const { ready, isAuthenticated } = useAuth();
  const [pending, setPending] = useState(false);
  const [notifyPending, setNotifyPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [line, setLine] = useState<CartLine | null>(null);
  const stockCap = Math.max(0, input.stockAvailable ?? 0);
  const outOfStock = disabled || stockCap <= 0;

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
    if (outOfStock || pending) return;
    setPending(true);
    setMessage(null);
    try {
      const cart = await addCartItem({
        ...input,
        quantity: input.quantity ?? 1,
        stockAvailable: stockCap,
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
    if (!line) return;
    const maxQty = Math.max(line.stockAvailable || 0, 1);
    if (next > maxQty) {
      setMessage(maxStockMessage(maxQty));
      return;
    }

    const prev = line;
    // Optimistic UI — no loading flash on +/-.
    if (next <= 0) {
      setLine(null);
    } else {
      setLine({ ...line, quantity: next });
    }
    setMessage(null);

    try {
      if (next <= 0) {
        const cart = await removeCartItem(prev.id);
        const match =
          cart.items.find((item) => lineMatches(item, input)) ?? null;
        setLine(match);
      } else {
        const cart = await updateCartItemQty(prev.id, next);
        const match =
          cart.items.find((item) => lineMatches(item, input)) ?? null;
        setLine(match);
      }
    } catch (err) {
      setLine(prev);
      setMessage(
        err instanceof Error ? err.message : "به‌روزرسانی تعداد ناموفق بود",
      );
      await syncFromCart();
    }
  }

  async function handleNotifyMe() {
    if (notifyPending || !ready) return;
    if (!isAuthenticated) {
      window.location.assign(
        `/users/login?returnUrl=${encodeURIComponent(`/product/${input.productSlug}`)}`,
      );
      return;
    }
    setNotifyPending(true);
    setMessage(null);
    try {
      await addToWishlist({
        productSlug: input.productSlug,
        title: input.title,
        imageUrl: input.imageUrl,
        priceAmount: input.unitPrice,
      });
      setMessage("به لیست انتظار اضافه شد — موجود شد خبرتان می‌کنیم");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "افزودن به لیست انتظار ناموفق بود",
      );
    } finally {
      setNotifyPending(false);
    }
  }

  const maxQty = Math.max(
    line?.stockAvailable ?? stockCap,
    line?.quantity ?? 1,
    1,
  );

  if (line && line.quantity > 0) {
    return (
      <div className={wrapperClassName}>
        <div className="flex w-full flex-col items-stretch gap-1">
          <CartQtyStepper
            quantity={line.quantity}
            max={maxQty}
            disabled={false}
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

  if (outOfStock) {
    return (
      <div className={wrapperClassName}>
        <button
          type="button"
          data-testid={testId}
          disabled={notifyPending}
          onClick={() => void handleNotifyMe()}
          className={
            className ||
            "flex h-12 w-full items-center justify-center rounded-[var(--medium-radius)] bg-[var(--color-secondary-500)] text-sm font-medium text-white"
          }
        >
          {notifyPending ? "در حال ثبت…" : "موجود شد خبرم کن"}
        </button>
        {message ? (
          <p className="mt-1 text-[11px] text-[var(--color-neutral-600)]">
            {message}
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-[var(--color-neutral-500)]">
            {disabledLabel}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        data-testid={testId}
        disabled={pending}
        onClick={() => void handleAdd()}
        className={className}
      >
        {pending ? "در حال افزودن…" : label}
      </button>
      {message ? (
        <p className="mt-1 text-[11px] text-[var(--color-neutral-600)]">{message}</p>
      ) : null}
    </div>
  );
}
