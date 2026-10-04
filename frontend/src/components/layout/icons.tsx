type IconProps = {
  className?: string;
  title?: string;
};

const base = "shrink-0";

/** Barghchi-style stroke search. */
export function SearchIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={19}
      fill="none"
      viewBox="0 0 18 19"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M13.125 13.375 16.5 16.75"
      />
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M15 8.5a6.75 6.75 0 1 0-13.5 0 6.75 6.75 0 0 0 13.5 0Z"
      />
    </svg>
  );
}

/** Barghchi-style invoice / proforma document. */
export function InvoiceDocIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7h8M8 11h5M8 15h6M7 3h10a2 2 0 0 1 2 2v14l-3.5-1.5L12 19l-3.5-1.5L5 19V5a2 2 0 0 1 2-2Z"
      />
    </svg>
  );
}

/** Barghchi-style organizational / clipboard. */
export function OrgPurchaseIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v0ZM9 12h6M9 16h4"
      />
    </svg>
  );
}

/** Barghchi-style seller / storefront. */
export function SellerShopIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5 5.5 4h13L21 7.5H3ZM9 14h6v6H9v-6Z"
      />
    </svg>
  );
}

/** Barghchi-style open box. */
export function OpenBoxIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.5 12 3 3 8.5l9 5.5 9-5.5Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.5V16l9 5 9-5V8.5M12 14v7"
      />
    </svg>
  );
}

/** Barghchi-style wrench / services. */
export function WrenchServiceIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.7 6.3a4.5 4.5 0 0 0-6.2 6.2L3 18l3 3 5.5-5.5a4.5 4.5 0 0 0 6.2-6.2l-2.5 2.5-3-3 2.5-2.5Z"
      />
    </svg>
  );
}

/** Digikala-style visual-search camera (outline). */
export function CameraIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4.5 7.5h2.2l1.3-2h8l1.3 2h2.2A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V9a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="13" r="3.25" />
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

/** Barghchi-style outline wishlist heart. */
export function WishlistHeartIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={21}
      height={21}
      fill="none"
      viewBox="0 0 18 16"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M14.597 1.996c-2.011-1.234-3.767-.737-4.821.055-.433.325-.649.487-.776.487s-.343-.162-.776-.487c-1.054-.792-2.81-1.29-4.82-.055-2.64 1.619-3.238 6.96 2.85 11.467 1.16.858 1.74 1.287 2.746 1.287s1.586-.43 2.745-1.287c6.089-4.507 5.491-9.848 2.852-11.467Z"
      />
    </svg>
  );
}

/** Barghchi-style stroke user for login button. */
export function LoginUserIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={22}
      fill="none"
      viewBox="0 0 20 22"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4.578 14.732c-1.415.842-5.125 2.562-2.865 4.715 1.103 1.051 2.332 1.803 3.878 1.803h8.818c1.545 0 2.775-.752 3.878-1.803 2.26-2.153-1.45-3.873-2.865-4.715a10.66 10.66 0 0 0-10.844 0"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M14.5 5.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
      />
    </svg>
  );
}

/** Barghchi-style dual chat bubbles (bottom-nav support). */
/** Dual speech-bubble chat mark (filled) shared by desktop FAB and mobile nav. */
export function BottomNavChatIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      viewBox="0 0 56 54"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        fill="currentColor"
        d="M23.692 0C10.608 0 0 9.67 0 21.6c0 6.127 2.818 11.638 7.316 15.563-.646 2.119-1.991 4.226-4.464 6.105l-.004.004a1.08 1.08 0 0 0-.694 1.008 1.08 1.08 0 0 0 1.077 1.08q.11-.001.219-.025c4.178-.013 7.743-1.803 10.58-4.046a25 25 0 0 0 4.215 1.316 17.7 17.7 0 0 1-1.014-5.885c0-10.72 9.662-19.44 21.538-19.44 2.977 0 5.814.548 8.397 1.54C45.666 8.206 35.74 0 23.692 0M38.77 21.6c-4.57 0-8.952 1.593-12.184 4.429-3.231 2.835-5.047 6.68-5.047 10.691 0 4.01 1.816 7.856 5.047 10.691 3.232 2.836 7.614 4.429 12.184 4.429a19.4 19.4 0 0 0 6.428-1.101c2.642 1.85 5.838 3.223 9.499 3.236A1.072 1.072 0 0 0 56 52.92a1.08 1.08 0 0 0-.707-1.013c-1.97-1.5-3.234-3.152-3.992-4.834 3.011-2.8 4.692-6.503 4.699-10.353 0-4.01-1.815-7.856-5.047-10.691S43.34 21.6 38.77 21.6"
      />
    </svg>
  );
}

/** Barghchi-style 2×2 category grid (stroke). */
export function BottomNavCategoryIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M2 18c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777C3.689 14 4.46 14 6 14s2.31 0 2.876.347c.317.194.583.46.777.777C10 15.689 10 16.46 10 18s0 2.31-.347 2.877c-.194.316-.46.582-.777.776C8.311 22 7.54 22 6 22s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C2 20.31 2 19.54 2 18ZM14 18c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777C15.689 14 16.46 14 18 14s2.31 0 2.877.347c.316.194.582.46.776.777C22 15.689 22 16.46 22 18s0 2.31-.347 2.877c-.194.316-.46.582-.776.776C20.31 22 19.54 22 18 22s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C14 20.31 14 19.54 14 18ZM2 6c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777C3.689 2 4.46 2 6 2s2.31 0 2.876.347c.317.194.583.46.777.777C10 3.689 10 4.46 10 6s0 2.31-.347 2.876c-.194.317-.46.583-.777.777C8.311 10 7.54 10 6 10s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C2 8.311 2 7.54 2 6ZM14 6c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777C15.689 2 16.46 2 18 2s2.31 0 2.877.347c.316.194.582.46.776.777C22 3.689 22 4.46 22 6s0 2.31-.347 2.876c-.194.317-.46.583-.776.777C20.31 10 19.54 10 18 10s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C14 8.311 14 7.54 14 6Z"
      />
    </svg>
  );
}

/** Barghchi-style bag cart (stroke). */
export function BottomNavCartIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={23}
      fill="none"
      viewBox="0 0 22 23"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="m2.062 14.443.365-2.071c.432-2.448.647-3.672 1.502-4.397s2.083-.725 4.538-.725h5.066c2.455 0 3.683 0 4.538.725s1.07 1.949 1.502 4.397l.365 2.071c.598 3.388.896 5.082-.023 6.195-.92 1.112-2.62 1.112-6.017 1.112H8.102c-3.398 0-5.097 0-6.017-1.113s-.62-2.806-.023-6.194ZM6.5 7.25l.168-2.014a4.347 4.347 0 0 1 8.664 0L15.5 7.25"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M14 10.25c-.13 1.413-1.434 2.5-3 2.5s-2.87-1.087-3-2.5"
      />
    </svg>
  );
}

/** Barghchi-style profile (stroke). */
export function BottomNavProfileIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={22}
      fill="none"
      viewBox="0 0 20 22"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4.578 14.732c-1.415.842-5.125 2.562-2.865 4.715 1.103 1.051 2.332 1.803 3.878 1.803h8.818c1.545 0 2.775-.752 3.878-1.803 2.26-2.153-1.45-3.873-2.865-4.715a10.66 10.66 0 0 0-10.844 0"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M14.5 5.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
      />
    </svg>
  );
}

/** Barghchi-style home (stroke). */
export function BottomNavHomeIcon({ className = "", title }: IconProps) {
  return (
    <svg
      className={`${base} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      fill="none"
      viewBox="0 0 22 22"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 16h.009"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M19 7.5v5c0 3.771 0 5.657-1.172 6.828S14.771 20.5 11 20.5s-5.657 0-6.828-1.172S3 16.271 3 12.5v-5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m21 9.5-4.343-4.165C13.99 2.778 12.657 1.5 11 1.5S8.01 2.778 5.343 5.335L1 9.5"
      />
    </svg>
  );
}

/** Digikala-style filled home (active bottom-nav). */
export function HomeFillIcon({ className = "", title }: IconProps) {
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
      <path d="M12 3 2 12h3v8a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-8h3L12 3Z" />
    </svg>
  );
}

/** Digikala-style outline home (inactive bottom-nav). */
export function HomeOutlineIcon({ className = "", title }: IconProps) {
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
      <path d="M12 4.5 4 11.2V20a1 1 0 0 0 1 1h5v-5.5h4V21h5a1 1 0 0 0 1-1v-8.8L12 4.5Zm0 2.3 6 5V19h-3v-5.5a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1V19H6v-7.2l6-5Z" />
    </svg>
  );
}

/** Digikala-style 2×2 category grid. */
export function CategoryOutlineIcon({ className = "", title }: IconProps) {
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
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
    </svg>
  );
}

/** Digikala-style community / inquiry bubble. */
export function CommunityIcon({ className = "", title }: IconProps) {
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
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9.5L5 20.5V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9h2.5V17.2L9.2 15H20V6H4Zm3.5 3h9v2h-9V9Zm0 3.5h6v2h-6v-2Z" />
    </svg>
  );
}

/** Digikala-style outline profile (bottom-nav). */
export function ProfileOutlineIcon({ className = "", title }: IconProps) {
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
      <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 7c3.87 0 7 2.02 7 4.5V20H5v-2.5C5 15.02 8.13 13 12 13Zm0 2c-2.76 0-5 1.16-5 2.5V18h10v-.5c0-1.34-2.24-2.5-5-2.5Z" />
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

export function ChevronDownIcon({
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
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
    </svg>
  );
}

export function ChevronUpIcon({
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
      <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41Z" />
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

/** Barghchi-style percent badge for special-offers header link */
export function SpecialOfferBadgeIcon({
  className = "",
  title,
}: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      fill="none"
      viewBox="0 0 22 22"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M6.692 18.866c.59 0 .886 0 1.155.1q.057.021.111.046c.261.12.47.328.888.746.962.962 1.443 1.443 2.034 1.488q.12.009.24 0c.591-.045 1.072-.526 2.034-1.488.418-.418.627-.626.888-.746q.054-.025.11-.046c.27-.1.565-.1 1.156-.1h.11c1.507 0 2.261 0 2.73-.468s.468-1.223.468-2.73v-.11c0-.59 0-.886.1-1.155q.021-.057.046-.111c.12-.261.328-.47.746-.888.962-.962 1.443-1.443 1.488-2.034q.009-.12 0-.24c-.045-.591-.526-1.072-1.488-2.034-.418-.418-.626-.627-.746-.888a2 2 0 0 1-.046-.11c-.1-.27-.1-.565-.1-1.156v-.11c0-1.507 0-2.261-.468-2.73s-1.223-.468-2.73-.468h-.11c-.59 0-.886 0-1.155-.1a2 2 0 0 1-.111-.046c-.261-.12-.47-.328-.888-.746-.962-.962-1.443-1.443-2.034-1.488a2 2 0 0 0-.24 0c-.591.045-1.072.526-2.034 1.488-.418.418-.627.627-.888.746a2 2 0 0 1-.11.046c-.27.1-.565.1-1.156.1h-.11c-1.507 0-2.261 0-2.73.468s-.468 1.223-.468 2.73v.11c0 .59 0 .886-.1 1.155q-.022.057-.046.111c-.12.261-.328.47-.746.888-.962.962-1.443 1.443-1.488 2.034a2 2 0 0 0 0 .24c.045.591.526 1.072 1.488 2.034.418.418.627.627.746.888q.025.054.046.11c.1.27.1.565.1 1.156v.11c0 1.507 0 2.261.468 2.73s1.223.468 2.73.468z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m14 8.25-6 6"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M14 14.25h-.01m-5.98-6H8"
      />
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
