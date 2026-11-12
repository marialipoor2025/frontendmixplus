type ProductRichTextProps = {
  text: string;
  className?: string;
};

/**
 * Digikala review/intro bodies use bare newlines; short lines are section titles.
 */
export function ProductRichText({ text, className }: ProductRichTextProps) {
  const blocks = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const next = blocks[index + 1];
        const isHeading =
          block.length > 0 &&
          block.length <= 56 &&
          !/[.!?…:]$/.test(block) &&
          Boolean(next && next.length > block.length + 20);

        if (isHeading) {
          return (
            <p
              key={`h-${index}`}
              className="mt-4 mb-1 text-sm font-bold leading-[1.8] text-[var(--color-neutral-900)] first:mt-0"
            >
              {block}
            </p>
          );
        }

        return (
          <p
            key={`p-${index}`}
            className="mb-2 text-[13px] leading-[2.15] text-[var(--color-neutral-800)] last:mb-0"
          >
            {block}
          </p>
        );
      })}
    </div>
  );
}
