type IconProps = {
  className?: string;
  title?: string;
};

const base = "shrink-0";

export function SearchIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
    </svg>
  );
}

export function NotificationIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" />
    </svg>
  );
}

export function UserIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

export function CartIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M7 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm10 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2ZM7.16 14h9.69a1 1 0 0 0 .96-.74l1.8-6.5A1 1 0 0 0 18.65 5H6.21l-.36-1.37A1 1 0 0 0 4.89 3H3v2h1.39l2.3 8.63-.9 1.62A1 1 0 0 0 6.7 17H19v-2H7.42l.74-1Z" />
    </svg>
  );
}

export function HamburgerIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  );
}

type ChevronIconProps = IconProps & { size?: number };

export function ChevronLeftIcon({
  className = "",
  title,
  size = 16,
}: ChevronIconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59Z" />
    </svg>
  );
}

export function ChevronRightIcon({
  className = "",
  title,
  size = 16,
}: ChevronIconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59Z" />
    </svg>
  );
}

/** Digikala-style تومان glyph for price rows. */
export function TomanIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={16}
      height={16}
      viewBox="0 0 1024 1024"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M86 479l-1 1v225c0 48 10 83 28 104 19 21 51 32 95 32l22 0c20 0 37-5 50-14 15-9 24-26 30-50h2c-1 1-1 2-1 3v4c0 19 9 34 25 45 17 11 41 17 71 17 7 0 14 0 22-1 8-1 16-2 25-3l23-19c4-15 6-29 8-43 1-14 2-27 2-39 0-42-9-74-27-97-18-22-44-34-77-34-27 0-50 9-68 25-18 16-29 38-34 66l-1 7c-7 31-23 47-49 47l-23 0c-17 0-30-4-36-12-7-8-10-23-10-43v-181c-17-4-32-10-47-18l0 0c-11-7-20-14-29-22zM355 696c6-6 15-9 27-9 13 0 22 5 29 14 7 10 11 25 11 45 0 3-1 6-1 10 0 2 0 6 0 9-7 1-13 1-18 1-17 0-31-4-42-11-10-8-16-19-16-33 0-11 4-20 10-26zM947 711v-121h-77l3 110c0 15-3 25-9 30-6 5-17 7-33 7l-78 0c-1-34-7-61-16-82-10-21-22-37-37-47-15-10-33-15-52-15-18 0-35 5-51 15-16 9-29 23-40 42-9 18-14 41-14 67 0 35 9 61 28 80 19 18 44 26 76 26h34c-6 11-14 18-24 24-10 6-24 10-42 13l-7 1c-12 2-27 4-44 6l-22 2-5 7 15 75c60-1 105-13 136-34 30-21 50-52 59-94h81c41 0 72-9 90-28 20-19 29-47 29-84zM620 679c8-6 17-10 27-10 25 0 38 26 41 79h-38c-27 0-41-12-41-36 0-15 3-26 11-33zM754 531h145l6-5v-61h-151v66zM422 141l10 101c4 47 0 88-13 122-12 34-32 60-60 78-27 18-56 27-96 27 17 0-35 0-35 0-36 0-65-6-87-19-21-12-37-29-46-51-9-21-14-45-14-72 0-21 2-43 7-66 4-24 9-47 16-69h69v5c-5 21-9 41-12 60s-6 37-6 52c0 23 6 41 17 54 11 14 31 20 59 20l7 0c14 0 41 0 29 0 32 0 53-11 70-33 17-22 24-52 20-90l-12-119h77zM290 73v67l-5 5h-74v-72h79z" />
    </svg>
  );
}

export function LocationPinIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
    </svg>
  );
}

export function AmazingIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 2 9.5 8.5 3 9l5 4.2L6.5 20 12 16.5 17.5 20 16 13.2 21 9l-6.5-.5L12 2Z" />
    </svg>
  );
}

export function TrendIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M3.5 18.5 9 13l3 3 7.5-8.5 1.5 1.5L12 20l-3-3-4 4.5-1.5-3Z" />
    </svg>
  );
}

export function BrandsIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4 6h6v6H4V6Zm10 0h6v6h-6V6ZM4 16h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
    </svg>
  );
}

export function ServiceIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M22.7 19.3 19 15.6a8 8 0 1 0-2.8 2.8l3.7 3.7 2.8-2.8ZM10 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6Z" />
    </svg>
  );
}

export function B2bIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4 7h16v2H4V7Zm0 4h16v9H4v-9Zm2 2v5h3v-5H6Zm5 0v5h3v-5h-3Zm5 0v5h3v-5h-3ZM7 3h10v3H7V3Z" />
    </svg>
  );
}

export function GiftIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M20 7h-2.2a3 3 0 0 0-5.3-2.2A3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3h18V8a1 1 0 0 0-1-1ZM9 5a1 1 0 1 1-1 1 1 1 0 0 1 1-1Zm6 0a1 1 0 1 1-1 1 1 1 0 0 1 1-1ZM3 13v7a1 1 0 0 0 1 1h7v-8H3Zm10 0v8h7a1 1 0 0 0 1-1v-7h-8Z" />
    </svg>
  );
}

export function StockIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4 4h16l1 5H3l1-5Zm0 7h16v9H4v-9Zm7 2v5h2v-5h-2Zm5.5-6.5L15 4H9l-1.5 2.5h9Z" />
    </svg>
  );
}

export function InstallmentIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M21 7H3a1 1 0 0 0-1 1v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1Zm-1 3v1.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 11.5V10h16ZM7 4h10v2H7V4Z" />
    </svg>
  );
}

/** Category sidebar icons keyed by mock `icon` field */
export function NavCategoryIcon({
  name,
  className = "",
  active = false,
}: {
  name: string;
  className?: string;
  active?: boolean;
}) {
  const color = active
    ? "text-[var(--color-icon-primary)]"
    : "text-[var(--color-icon-high-emphasis)]";

  const props = {
    className: `${base} ${color} ${className}`,
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "currentColor" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "appliance":
      return (
        <svg {...props}>
          <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v3h12V5H6Zm0 5v9h12v-9H6Zm3 2h6v2H9v-2Zm0 4h4v2H9v-2Z" />
        </svg>
      );
    case "fridge":
      return (
        <svg {...props}>
          <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v7h10V4H7Zm0 9v7h10v-7H7Zm8 1.5a1 1 0 1 1-1 1 1 1 0 0 1 1-1Zm0-8a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "washer":
      return (
        <svg {...props}>
          <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 4v14h12V6H6Zm6 2a5 5 0 1 1-5 5 5 5 0 0 1 5-5Zm0 2a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z" />
        </svg>
      );
    case "kitchen":
      return (
        <svg {...props}>
          <path d="M4 4h16v2H4V4Zm1 4h14l-1 12H6L5 8Zm3 2v8h2v-8H8Zm6 0v8h2v-8h-2Z" />
        </svg>
      );
    case "climate":
      return (
        <svg {...props}>
          <path d="M4 8h16a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2Zm1 6h2l1 4H4l1-4Zm12 0h2l1 4h-4l1-4Zm-6 0h2l1 4H10l1-4Z" />
        </svg>
      );
    case "vacuum":
      return (
        <svg {...props}>
          <path d="M8 3h8l1 6h2a3 3 0 0 1 3 3v2h-2v-2a1 1 0 0 0-1-1h-2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1L8 3Zm2 6h4l-.5-4h-3L10 9Z" />
        </svg>
      );
    case "tv":
      return (
        <svg {...props}>
          <path d="M3 5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H8v-2h3v-2H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v9h16V7H4Z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
        </svg>
      );
  }
}

export function ExpandLessIcon({
  className = "",
  title,
  size = 24,
}: ChevronIconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 8.59 6.41 14.17 7.83 15.59 12 11.41l4.17 4.18 1.42-1.42L12 8.59Z" />
    </svg>
  );
}

function socialSvg(
  className: string,
  title: string | undefined,
  size: number,
  path: string,
) {
  return (
    <svg
      className={`${base} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  );
}

export function InstagramIcon({
  className = "",
  title,
  size = 40,
}: ChevronIconProps) {
  return socialSvg(
    className,
    title,
    size,
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm11 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  );
}

export function TwitterIcon({
  className = "",
  title,
  size = 40,
}: ChevronIconProps) {
  return socialSvg(
    className,
    title,
    size,
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.726-8.835L1.254 2.25H8.08l4.258 5.686L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z",
  );
}

export function LinkedInIcon({
  className = "",
  title,
  size = 40,
}: ChevronIconProps) {
  return socialSvg(
    className,
    title,
    size,
    "M6.5 6.5A2.25 2.25 0 1 1 4.25 4.25 2.25 2.25 0 0 1 6.5 6.5ZM4.5 9h4v11h-4V9Zm6 0h3.8v1.51h.05A4.17 4.17 0 0 1 18.3 9C21.4 9 22 11.1 22 14.25V20h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V20h-4V9Z",
  );
}

export function AparatIcon({
  className = "",
  title,
  size = 40,
}: ChevronIconProps) {
  return socialSvg(
    className,
    title,
    size,
    "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.2 5.5h2.4l.6 3.6 2.7-2.5 1.7 1.7-2.5 2.7 3.6.6v2.4l-3.6.6 2.5 2.7-1.7 1.7-2.7-2.5-.6 3.6h-2.4l-.6-3.6-2.7 2.5-1.7-1.7 2.5-2.7-3.6-.6v-2.4l3.6-.6-2.5-2.7 1.7-1.7 2.7 2.5.6-3.6Z",
  );
}
