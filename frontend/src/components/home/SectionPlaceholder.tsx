type SectionPlaceholderProps = {
  name: string;
  description: string;
};

/** Temporary shell while we build each Digikala-style section. */
export function SectionPlaceholder({
  name,
  description,
}: SectionPlaceholderProps) {
  return (
    <section
      className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-8"
      aria-label={name}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
        Pending component
      </p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--color-text)]">
        {name}
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
        {description}
      </p>
    </section>
  );
}
