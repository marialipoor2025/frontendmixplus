"use client";

import { useState, type MouseEvent } from "react";
import { CartIcon } from "@/components/layout/icons";
import { addCartItem } from "@/lib/api/cart";
import type { Product } from "@/types/product";

type ProductCardBasketButtonProps = {
  product: Product;
};

/**
 * Compact ATC control for listing cards (stops Link navigation).
 * Guests can add without login.
 */
export function ProductCardBasketButton({
  product,
}: ProductCardBasketButtonProps) {
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product.inStock) return null;

  async function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    setPending(true);
    try {
      await addCartItem({
        productSlug: product.slug,
        offerExternalKey: product.sellerId || product.id,
        skuExternalKey: product.skuCode || "default",
        sellerExternalKey: product.sellerId,
        sellerName: product.sellerName,
        title: product.title,
        imageUrl: product.imageUrl,
        unitPrice: product.price.amount,
        originalPrice: product.originalPrice?.amount,
        discountPercent: product.discountPercent,
        currency: product.price.currency || "IRT",
        quantity: 1,
        stockAvailable: 99,
      });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch {
      // Keep silent on card; user can retry from PDP.
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={added ? "به سبد اضافه شد" : "افزودن به سبد خرید"}
      title={added ? "به سبد اضافه شد" : "افزودن به سبد"}
      disabled={pending}
      onClick={(e) => void handleClick(e)}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors sm:size-9 ${
        added
          ? "border-[var(--color-success)] bg-[rgb(0_160_73/0.12)] text-[var(--color-success)]"
          : "border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] text-[var(--color-offers-blue)] hover:border-[var(--color-offers-blue)]"
      }`}
    >
      <CartIcon className="size-4 sm:size-[18px]" />
    </button>
  );
}
