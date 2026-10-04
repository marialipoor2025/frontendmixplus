type ProductSectionTitleProps = {
  title: string;
  as?: "h2" | "p";
};

/** Red underline heading used across lower PDP tab panels. */
export function ProductSectionTitle({
  title,
  as: Tag = "h2",
}: ProductSectionTitleProps) {
  return (
    <div className="break-words py-3">
      <div className="flex grow items-center">
        <Tag className="grow text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
          <span className="relative">{title}</span>
        </Tag>
      </div>
      <div className="mt-2 h-0.5 w-10 rounded-sm bg-[var(--color-primary-500)]" />
    </div>
  );
}
