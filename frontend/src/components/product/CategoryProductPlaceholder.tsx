import {
  categoryPlaceholderColors,
  type CategoryPlaceholderColors,
} from "@/lib/product-image-placeholder";

type CategoryProductPlaceholderProps = {
  /** Category external key / href — same seed → same color. */
  seed: string;
  className?: string;
  /** Optional override (e.g. see-all mini tiles). */
  colors?: CategoryPlaceholderColors;
};

/**
 * Soft category-colored tile used when a product has no real image.
 * Not the shared appliance PNG.
 */
export function CategoryProductPlaceholder({
  seed,
  className = "",
  colors,
}: CategoryProductPlaceholderProps) {
  const { bg, fg } = colors ?? categoryPlaceholderColors(seed);

  return (
    <span
      aria-hidden
      className={`absolute inset-0 flex items-center justify-center ${className}`}
      style={{ backgroundColor: bg }}
    >
      <svg
        viewBox="0 0 48 48"
        className="h-[42%] w-[42%] max-h-14 max-w-14 opacity-90"
        fill="none"
      >
        <rect
          x="10"
          y="14"
          width="28"
          height="22"
          rx="3"
          stroke={fg}
          strokeWidth="2"
        />
        <path
          d="M16 14v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"
          stroke={fg}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="25" r="3.5" stroke={fg} strokeWidth="2" />
      </svg>
    </span>
  );
}
