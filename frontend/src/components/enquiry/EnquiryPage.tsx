"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { siteConfig } from "@/config/site";
import { SHOWCASE_BRANDS } from "@/lib/showcase-brands";
import type { BreadcrumbItem } from "@/types/product-detail";

const BREADCRUMB: BreadcrumbItem[] = [
  { id: "home", title: siteConfig.nameFa, href: "/" },
  { id: "enquiry", title: "استعلام قیمت همکار", href: "/enquiry" },
];

const SUPPORT_PHONE_DISPLAY = "۰۲۱-۶۱۹۳۰۰۰۰";
const SUPPORT_PHONE_TEL = "02161930000";
const SUPPORT_EMAIL = "info@oriyamarket.ir";

type ProcessTone = "primary" | "info";

type ProcessStep = {
  title: string;
  subtitle: string;
  tone: ProcessTone;
  icon: "request" | "consult" | "proforma" | "supply" | "deliver";
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    title: "ثبت درخواست",
    subtitle: "ثبت آنلاین درخواست",
    tone: "primary",
    icon: "request",
  },
  {
    title: "انجام مشاوره",
    subtitle: "انجام مشاوره رایگان",
    tone: "info",
    icon: "consult",
  },
  {
    title: "ارائه پیش فاکتور",
    subtitle: "لیست قیمت در اسرع وقت",
    tone: "primary",
    icon: "proforma",
  },
  {
    title: "تامین کالا",
    subtitle: "تامین سریع کالا",
    tone: "info",
    icon: "supply",
  },
  {
    title: "تحویل سفارش",
    subtitle: "تحویل آنی سفارش",
    tone: "primary",
    icon: "deliver",
  },
];

/** Drop the real asset at this path when ready (replaces the on-page placeholder). */
const SERVICES_IMAGE_SRC = "/images/enquiry/oriyamarket-services.jpg";

/** Customer logos — drop PNGs into `public/images/customers/` to replace placeholders. */
const CUSTOMER_LOGOS = [
  { id: "irancell", name: "Irancell", src: "/images/customers/irancell-logo.png" },
  { id: "irankhodro", name: "ایران‌خودرو", src: "/images/customers/irankhodro-logo.png" },
  { id: "mci", name: "همراه‌اول", src: "/images/customers/mci-logo.png" },
  { id: "mihan", name: "میهن", src: "/images/customers/mihan-logo.png" },
  { id: "mobinnet", name: "مبین‌نت", src: "/images/customers/mobinnet-logo.png" },
  { id: "saipa", name: "سایپا", src: "/images/customers/saipa-logo.png" },
  { id: "taminejtemai", name: "تأمین اجتماعی", src: "/images/customers/taminejtemai-logo.png" },
  { id: "tcl", name: "TCL", src: "/images/customers/tcl-logo.png" },
] as const;

function CustomerLogo({
  name,
  src,
}: {
  name: string;
  src: string;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-md bg-[#eef2f8]">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={100}
          height={100}
          className={[
            "h-full w-full object-contain transition-opacity",
            ready ? "opacity-100" : "opacity-0",
          ].join(" ")}
          loading="lazy"
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
      {!ready ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-[#9aa8c2]"
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

function CarouselChevron({ flipped }: { flipped?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="20"
      fill="none"
      viewBox="0 0 12 20"
      className={flipped ? "rotate-180" : undefined}
      aria-hidden
    >
      <path
        fill="#111"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.891 1.317a1.437 1.437 0 0 1 0 2.033L4.241 10l6.65 6.65a1.438 1.438 0 0 1-2.033 2.033l-7.666-7.666a1.44 1.44 0 0 1 0-2.033l7.666-7.667a1.437 1.437 0 0 1 2.033 0"
      />
    </svg>
  );
}

const SERVICE_ITEMS = [
  {
    id: "import",
    title: "واردات و بازرگانی تخصصی",
    icon: "import" as const,
    body: `در مجموعه ${siteConfig.nameFa}، با تکیه بر تجربه تخصصی در حوزه تأمین لوازم خانگی، کالاهای مورد نیاز کارفرمایان را به‌صورت هدفمند شناسایی کرده و در کوتاه‌ترین زمان فرآیند تأمین و واردات آن‌ها را انجام می‌دهیم.`,
  },
  {
    id: "b2b",
    title: "فروش همکاری و سازمانی",
    icon: "b2b" as const,
    body: `در ${siteConfig.nameFa}، همکاری صرفاً یک خرید نیست، بلکه تأمین پایدار تجهیزات برای پروژه‌های سازمانی است. ما با ایجاد بستر همکاری بلندمدت با کارفرمایان، شرکت‌ها و پیمانکاران، فرآیند تأمین و واردات تجهیزات تخصصی را به‌گونه‌ای مدیریت می‌کنیم که نیازهای پروژه‌ها در کوتاه‌ترین زمان و با بالاترین اطمینان برآورده شود.`,
  },
] as const;

function ServicesImage() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#e8eef8]">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={SERVICES_IMAGE_SRC}
          alt={`خدمات ${siteConfig.nameFa}`}
          width={600}
          height={600}
          className={[
            "h-full w-full object-cover transition-opacity",
            ready ? "opacity-100" : "opacity-0",
          ].join(" ")}
          loading="lazy"
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
      {!ready ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#2a75bb]"
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <span className="text-sm font-medium">جای تصویر خدمات</span>
          <span className="px-4 text-center text-xs text-[var(--color-neutral-500)]">
            فایل را در public/images/enquiry/oriyamarket-services.jpg قرار دهید
          </span>
        </div>
      ) : null}
    </div>
  );
}

function ServiceIcon({ icon }: { icon: (typeof SERVICE_ITEMS)[number]["icon"] }) {
  if (icon === "import") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="none"
        viewBox="0 0 32 32"
        stroke="#2A75BB"
        className="shrink-0"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m26.322 23.322 1.132.6c.795.42 1.192.631 1.56.389.37-.243.341-.623.284-1.383-.326-4.368-5.735-7.364-9.476-4.416m.518 4.81-1.133-.6c-.793-.42-1.19-.63-1.56-.387-.369.244-.339.623-.278 1.381.345 4.332 5.723 7.368 9.372 4.486"
        />
        <path
          strokeLinecap="round"
          strokeWidth="2"
          d="M14.682 29.333c-6.746-.67-12.014-6.37-12.014-13.3 0-7.382 5.977-13.366 13.35-13.366 7.06 0 12.842 5.49 13.317 12.44"
        />
        <path
          strokeLinejoin="round"
          strokeWidth="2"
          d="M26.665 7.598c-1.246.09-2.842.573-3.95 2.006-1.998 2.587-3.998 2.803-5.33 1.94-2-1.293-.32-3.389-2.666-4.528-1.53-.742-1.743-2.762-.891-4.35M2.668 14.667c1.017.882 2.44 1.69 4.118 1.69 3.467 0 4.16.663 4.16 3.312s0 2.65.693 4.636c.451 1.292.609 2.585-.29 3.695"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="30"
      fill="none"
      viewBox="0 0 40 30"
      stroke="#2A75BB"
      className="shrink-0"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeWidth="2.5"
        d="M1.667 5.833h5.252c1.332 0 2.61-.66 3.552-1.833 1.346-1.676 3.336-2.262 5.141-1.512l2.555 1.061m-16.5 18.724h2.97c2.127 0 3.19 0 4.195.283l.146.042c.998.304 1.883.874 3.651 2.014 3.462 2.23 5.193 3.346 7.079 3.21q.134-.01.266-.025c1.877-.225 3.348-1.647 6.29-4.49l2.903-2.807"
      />
      <path
        strokeLinecap="round"
        strokeWidth="2.5"
        d="M38.333 6.262H33.72c-1.954 0-3.333-1.062-4.735-2.477-.908-.917-2.067-1.458-3.285-1.532-1.361-.083-2.94-.2-4.262.163-1.472.404-2.443 1.512-3.472 2.67l-2.653 2.986c-1.083 1.22-1.083 3.196 0 4.416.935 1.052 2.4 1.215 3.5.39.791-.594 1.69-1.554 2.624-1.856 1.05-.34 1.7.424 2.296 1.228l4.253 5.746c1.579 2.133 2.368 3.2 3.447 3.768 1.08.57 2.312.57 4.778.57h2.123"
      />
    </svg>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="relative mb-10 mt-14 text-center md:mb-12 md:mt-16">
      <span
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-px -translate-y-1/2 bg-[#e0e5f2]"
        aria-hidden
      />
      <h2 className="relative z-10 inline-block bg-white px-4 text-base font-bold text-[#2a75bb] md:text-xl">
        {children}
      </h2>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={`transition ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        stroke="#292D32"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
        d="m3.4 7.458 5.433 5.434a1.655 1.655 0 0 0 2.334 0L16.6 7.458"
      />
    </svg>
  );
}

/** RTL chevron between process cards (points toward next step). */
function ProcessArrow({ tone }: { tone: ProcessTone }) {
  if (tone === "info") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 30.1 40.9"
        className="h-8 w-5 shrink-0 lg:h-10 lg:w-7"
        aria-hidden
      >
        <path
          d="M2.3 25.2c-3-2.4-3-7 0-9.4L20.4 1.3c3.9-3.1 9.7-.3 9.7 4.7v28.9c0 5-5.8 7.8-9.7 4.7z"
          fill="#ebfafc"
        />
        <path
          d="M2.6 24.8c-2.8-2.2-2.8-6.4 0-8.6L20.7 1.7c3.6-2.9 8.9-.3 8.9 4.3v28.9c0 4.6-5.3 7.2-8.9 4.3z"
          fill="none"
          stroke="#00bad1"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 31 42"
      className="h-8 w-5 shrink-0 lg:h-10 lg:w-7"
      aria-hidden
    >
      <path
        fill="#fff"
        stroke="#E0E5F2"
        d="M3.196 25.372c-2.761-2.202-2.761-6.4 0-8.601L21.321 2.32c3.603-2.873 8.929-.307 8.929 4.3v28.903c0 4.607-5.326 7.173-8.929 4.3z"
      />
    </svg>
  );
}

function ProcessIcon({ icon }: { icon: ProcessStep["icon"] }) {
  switch (icon) {
    case "request":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" fill="none" viewBox="0 0 18 19" aria-hidden>
          <path stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" d="m12.33 16.26.415-.517c.364-.455 1.136-.418 1.444.069.37.585 1.283.469 1.536-.07.013-.028-.02.042.008-.2.029-.242.017-.298-.007-.408l-1.442-6.81c-.362-1.713-.543-2.568-1.167-3.071s-1.503-.503-3.263-.503H8.146c-1.76 0-2.64 0-3.263.503s-.805 1.358-1.167 3.07l-1.443 6.81c-.023.111-.035.167-.007.409s-.004.172.009.2c.253.539 1.166.655 1.536.07.308-.487 1.08-.524 1.444-.069l.415.518c.521.652 1.611.652 2.133 0l.065-.082c.554-.692 1.71-.692 2.264 0l.065.082c.522.652 1.612.652 2.134 0Z" />
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M1.863 7.375c-.44-.456-.357-1.043-.357-2.511s0-2.202.44-2.658c.438-.456 1.145-.456 2.558-.456h8.992c1.413 0 2.12 0 2.559.456s.439 1.19.439 2.658.082 2.055-.357 2.511" />
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7.75H6.75M10.5 10.75H6" />
        </svg>
      );
    case "consult":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" fill="none" viewBox="0 0 40 36" className="h-5 w-5" aria-hidden>
          <path stroke="currentColor" strokeWidth="2.5" d="M29.167 15.808c0-.633 0-.95.095-1.233.277-.82 1.008-1.139 1.74-1.472.823-.375 1.234-.562 1.642-.595.463-.038.927.062 1.322.284.525.294.89.854 1.265 1.309 1.73 2.1 2.594 3.15 2.91 4.309a5.4 5.4 0 0 1 0 2.847c-.46 1.69-1.919 3.105-2.998 4.416-.552.67-.828 1.006-1.177 1.202-.395.222-.859.321-1.322.284-.408-.033-.82-.22-1.642-.595-.732-.334-1.463-.652-1.74-1.473-.095-.282-.095-.599-.095-1.233zM10.833 15.808c0-.798-.022-1.515-.667-2.076-.235-.204-.546-.346-1.168-.63-.823-.374-1.235-.562-1.642-.594-1.224-.1-1.882.736-2.587 1.592-1.73 2.101-2.594 3.151-2.91 4.31a5.4 5.4 0 0 0 0 2.847c.46 1.69 1.919 3.105 2.998 4.416.68.826 1.33 1.58 2.499 1.486.407-.033.819-.22 1.642-.595.622-.284.933-.425 1.168-.63.645-.56.667-1.278.667-2.076z" />
          <path stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2.5" d="M7.167 12.5c0-6.075 5.745-11 12.833-11s12.833 4.925 12.833 11" />
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M32.833 27.167v1.466c0 3.24-3.283 5.867-7.333 5.867h-3.667" />
        </svg>
      );
    case "proforma":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden>
          <path stroke="currentColor" strokeWidth="1.5" d="M20.016 2C18.903 2 18 4.686 18 8h2.016c.972 0 1.457 0 1.758-.335.3-.336.248-.778.144-1.661C21.64 3.67 20.894 2 20.016 2Z" />
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 8.054v10.592c0 1.511 0 2.267-.462 2.565-.755.486-1.922-.534-2.509-.904-.485-.306-.727-.458-.996-.467-.291-.01-.538.137-1.062.467l-1.911 1.205c-.516.325-.773.488-1.06.488s-.545-.163-1.06-.488l-1.91-1.205c-.486-.306-.728-.458-.997-.467-.291-.01-.538.137-1.062.467-.587.37-1.754 1.39-2.51.904-.461-.298-.461-1.053-.461-2.565V8.054c0-2.854 0-4.28.879-5.167C3.757 2 5.172 2 8 2h12M6 6h8M8 10H6" />
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M12.5 10.875c-.828 0-1.5.588-1.5 1.313 0 .724.672 1.312 1.5 1.312s1.5.588 1.5 1.313c0 .724-.672 1.312-1.5 1.312m0-5.25c.653 0 1.209.365 1.415.875m-1.415-.875V10m0 6.125c-.653 0-1.209-.365-1.415-.875m1.415.875V17" />
        </svg>
      );
    case "supply":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22" aria-hidden>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 20.75c-.818 0-1.6-.33-3.163-.99C2.696 18.116.75 17.293.75 15.91V5.75m9 15c.818 0 1.6-.33 3.163-.99 3.891-1.644 5.837-2.466 5.837-3.849V5.75m-9 15V10.105M6.076 8.441 3.155 7.028C1.552 6.252.75 5.864.75 5.25s.802-1.002 2.405-1.778l2.92-1.413C7.88 1.186 8.78.75 9.75.75s1.871.436 3.674 1.309l2.921 1.413c1.603.776 2.405 1.164 2.405 1.778s-.802 1.002-2.405 1.778l-2.92 1.413C11.62 9.314 10.72 9.75 9.75 9.75s-1.871-.436-3.674-1.309M3.75 10.75l2 1M14.75 2.75l-10 5" />
        </svg>
      );
    case "deliver":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" fill="none" viewBox="0 0 40 32" className="h-5 w-5" aria-hidden>
          <path stroke="currentColor" strokeWidth="2.5" d="M33.75 26.083a4.583 4.583 0 1 1-9.167 0 4.583 4.583 0 0 1 9.167 0ZM15.417 26.083a4.583 4.583 0 1 1-9.167 0 4.583 4.583 0 0 1 9.167 0Z" />
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M24.583 26.083h-9.166m18.333 0h1.4c.402 0 .604 0 .773-.02a2.75 2.75 0 0 0 2.39-2.39c.02-.169.02-.37.02-.774v-5.066c0-6.581-5.335-11.916-11.916-11.916M1.667 1.333H20c2.593 0 3.889 0 4.695.806.805.805.805 2.102.805 4.694v15.584M1.667 17.375V21.5c0 1.713 0 2.57.368 3.208a2.75 2.75 0 0 0 1.007 1.007c.638.368 1.495.368 3.208.368M1.667 6.833h11m-11 5.5H9" />
        </svg>
      );
  }
}

/**
 * barghchi-style organizational price-enquiry landing (`/enquiry`).
 */
export function EnquiryPage() {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [family, setFamily] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [openServices, setOpenServices] = useState<Record<string, boolean>>(
    () => Object.fromEntries(SERVICE_ITEMS.map((item) => [item.id, true])),
  );
  const [brandIndex, setBrandIndex] = useState(0);
  const [customerIndex, setCustomerIndex] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "نام الزامی است";
    if (!family.trim()) next.family = "نام خانوادگی الزامی است";
    if (!mobile.trim()) next.mobile = "تلفن همراه الزامی است";
    else if (!/^09\d{9}$/.test(mobile.replace(/\D/g, "").replace(/^98/, "0"))) {
      next.mobile = "شماره موبایل معتبر نیست";
    }
    if (!description.trim()) next.description = "توضیحات الزامی است";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setToast("درخواست شما ثبت شد. کارشناسان به‌زودی تماس می‌گیرند.");
    setName("");
    setFamily("");
    setMobile("");
    setEmail("");
    setDescription("");
    setFileName(null);
    setErrors({});
  }

  const brandStep = 220;
  const brandOffset = brandIndex * brandStep;
  const customerStep = 220;
  const customerMaxIndex = Math.max(0, CUSTOMER_LOGOS.length - 4);
  const customerOffset = Math.min(customerIndex, customerMaxIndex) * customerStep;

  return (
    <div className="site-container pb-16 pt-2">
      <ProductBreadcrumb items={BREADCRUMB} />

      {/* Hero — barghchi price-inquiry banner */}
      <section
        className="relative mt-2 flex w-full items-center justify-start rounded-2xl bg-cover bg-center text-white md:h-[380px]"
        style={{
          backgroundImage: "url('/images/enquiry/price-inquiry-banner.jpg')",
        }}
      >
        <div className="px-2 py-4 text-center md:max-w-[50%] md:p-8 md:text-right md:leading-9">
          <h1 className="text-lg font-bold md:mb-4 md:text-2xl">
            {`استعلام قیمت از ${siteConfig.nameFa}`}
          </h1>
          <p className="mt-4 md:mt-0 md:max-w-[400px]">
            فروش همکاری و سازمانی | تأمین تخصصی لوازم خانگی
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            <button
              type="button"
              onClick={scrollToForm}
              className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#28c76f] px-4 py-1 text-sm font-medium text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 16 16"
                aria-hidden
              >
                <path
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  d="M12.001 10v4.667m2.334-2.334H9.668M4.668 10.667h2.667M4.668 7.333h5.333M4.333 2.333c-1.037.031-1.655.147-2.083.575-.586.587-.586 1.53-.586 3.418v4.337c0 1.887 0 2.831.586 3.417.586.587 1.528.587 3.414.587h2.003m2.661-12.334c1.037.031 1.656.147 2.084.575.585.587.585 1.53.585 3.418V8"
                />
                <path
                  stroke="#fff"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.332 2.5c0-.644.522-1.167 1.167-1.167h3.666a1.167 1.167 0 1 1 0 2.334H5.5A1.167 1.167 0 0 1 4.332 2.5Z"
                />
              </svg>
              <span>ثبت درخواست</span>
            </button>
            <Link
              href="/about"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#f89716] px-4 py-1 text-sm font-medium text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 16 16"
                aria-hidden
              >
                <path
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  d="M8 4v9.333"
                />
                <path
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3.986 2.19c2.227.424 3.555 1.312 4.013 1.82.458-.508 1.785-1.396 4.013-1.82 1.128-.215 1.692-.322 2.173.09.48.412.48 1.08.48 2.417v4.806c0 1.223 0 1.834-.308 2.216s-.987.511-2.345.77c-1.21.23-2.156.597-2.84.966C8.5 13.82 8.164 14 8 14s-.501-.181-1.174-.545c-.684-.369-1.629-.736-2.84-.966-1.357-.259-2.036-.388-2.345-.77-.308-.382-.308-.993-.308-2.216V4.697c0-1.337 0-2.005.48-2.417.481-.412 1.045-.305 2.174-.09"
                />
              </svg>
              <span>{`درباره ${siteConfig.nameFa}`}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mt-8 rounded-md bg-white md:p-5">
        <SectionHeading>فرم درخواست استعلام قیمت</SectionHeading>
        <div className="mx-auto grid max-w-[988px] gap-4 leading-7 md:grid-cols-2">
          <div className="hidden text-right text-sm text-[var(--color-neutral-650)] md:block">
            <div className="mb-12 mt-8">
              <p>
                شما می‌توانید از طریق فرم روبرو درخواست و نیازمندی‌های خود را در
                خصوص استعلام قیمت مطرح نمایید تا همکاران ما در اسرع وقت با شما
                تماس بگیرند.
              </p>
              <p className="mt-6">
                همچنین می‌توانید درخواست و پیام خود را به‌صورت مستقیم به آدرس
                ایمیل{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-[#2a75bb]"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                نیز ارسال فرمایید.
              </p>
              <div className="mt-8 mb-2 flex items-center gap-2 border-b border-[var(--color-neutral-300)] pb-2 font-bold text-[#2a75bb]">
                نکات قابل توجه
              </div>
              <ul className="mt-4 space-y-4">
                {[
                  "لطفا نام و نام خانوادگی را فارسی درج نمایید",
                  "شماره تماس خود را جهت ارتباط با کارشناسان وارد فرمایید",
                  "لطفا درخواست خود را شرح دهید",
                ].map((tip) => (
                  <li key={tip} className="flex items-center gap-2">
                    <span className="size-2 shrink-0 bg-[#2a75bb]" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl md:border md:border-[var(--color-neutral-300)] md:p-6">
            <form id={formId} ref={formRef} onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-[var(--color-neutral-900)]">
                    نام<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mb-1 w-full rounded-xl border border-[var(--color-neutral-200)] px-4 py-3 text-xs outline-none focus:border-[#2a75bb]"
                    placeholder="نام"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="given-name"
                  />
                  {errors.name ? (
                    <p className="mb-2 text-xs text-red-700">{errors.name}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-[var(--color-neutral-900)]">
                    نام خانوادگی<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mb-1 w-full rounded-xl border border-[var(--color-neutral-200)] px-4 py-3 text-xs outline-none focus:border-[#2a75bb]"
                    placeholder="نام خانوادگی"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                    autoComplete="family-name"
                  />
                  {errors.family ? (
                    <p className="mb-2 text-xs text-red-700">{errors.family}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-1">
                <label className="mb-2 block text-xs font-bold text-[var(--color-neutral-900)]">
                  تلفن همراه<span className="text-red-500">*</span>
                </label>
                <input
                  className="mb-1 w-full rounded-xl border border-[var(--color-neutral-200)] px-4 py-3 text-xs outline-none focus:border-[#2a75bb]"
                  placeholder="تلفن همراه"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.mobile ? (
                  <p className="mb-2 text-xs text-red-700">{errors.mobile}</p>
                ) : null}
              </div>

              <div className="mt-1">
                <label className="mb-2 block text-xs font-bold text-[var(--color-neutral-900)]">
                  ایمیل
                </label>
                <input
                  className="mb-3 w-full rounded-xl border border-[var(--color-neutral-200)] px-4 py-3 text-xs outline-none focus:border-[#2a75bb]"
                  placeholder="ایمیل"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="mb-3">
                <label className="mb-2 block text-sm font-bold text-[var(--color-neutral-900)]">
                  توضیحات شما<span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="mb-1 w-full rounded-2xl border border-[var(--color-neutral-200)] px-4 py-3 text-sm outline-none focus:border-[#2a75bb]"
                  placeholder="لطفا پیام خود را وارد نمایید"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description ? (
                  <p className="text-xs text-red-700">{errors.description}</p>
                ) : null}
              </div>

              <label className="mb-3 flex cursor-pointer gap-3 rounded-2xl border border-dashed border-[var(--color-neutral-300)] p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f0f9ff] text-[#026ccf]">
                  ↑
                </span>
                <span>
                  <span className="block text-sm font-medium text-[var(--color-neutral-800)]">
                    لیست محصولات را بارگذاری کنید
                  </span>
                  <span className="text-xs text-[var(--color-neutral-500)]">
                    PDF,DOCX,JPEG,XLSX حداکثر حجم ۱ مگ
                  </span>
                  {fileName ? (
                    <span className="mt-1 block text-xs text-[#2a75bb]">
                      {fileName}
                    </span>
                  ) : null}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.jpeg,.jpg,.xlsx,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setFileName(null);
                      return;
                    }
                    if (file.size > 1024 * 1024) {
                      setToast("حجم فایل نباید بیشتر از ۱ مگابایت باشد");
                      e.target.value = "";
                      return;
                    }
                    setFileName(file.name);
                  }}
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="mr-auto rounded-xl bg-[#2a75bb] px-4 py-1 text-xs whitespace-nowrap text-white md:px-8 md:text-sm"
                >
                  ارسال اطلاعات
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Contact channels */}
      <SectionHeading>{`راه‌های دریافت خدمات ${siteConfig.nameFa}`}</SectionHeading>
      <div className="mx-auto mt-6 flex max-w-[988px] flex-col justify-between gap-4 md:flex-row">
        <div className="mx-auto mt-4 w-full max-w-[300px] rounded-xl border border-[var(--color-neutral-200)] p-6 shadow-sm md:mt-0">
          <div className="flex items-center font-bold text-[#28c76f]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 18 18"
              stroke="#28C76F"
              className="shrink-0"
              aria-hidden
            >
              <g stroke="currentColor" strokeWidth="1.5" clipPath="url(#enquiry-phone)">
                <path
                  strokeLinejoin="round"
                  d="M2.833 8.957c-.71-1.24-1.054-2.252-1.261-3.279-.306-1.517.394-3 1.555-3.946.49-.4 1.053-.263 1.343.257l.655 1.175c.519.931.779 1.397.727 1.89-.051.494-.401.896-1.102 1.7zm0 0c1.44 2.51 3.698 4.769 6.21 6.21m0 0c1.24.71 2.252 1.054 3.279 1.261 1.517.306 3-.394 3.946-1.555.4-.49.263-1.053-.257-1.343l-1.175-.655c-.931-.519-1.397-.778-1.89-.727-.494.052-.896.402-1.7 1.101z"
                />
                <path
                  strokeLinecap="round"
                  d="M10.5 5.124A4.5 4.5 0 0 1 12.876 7.5m-1.885-6A8.08 8.08 0 0 1 16.5 7.01"
                />
              </g>
              <defs>
                <clipPath id="enquiry-phone">
                  <path fill="currentColor" d="M0 0h18v18H0z" />
                </clipPath>
              </defs>
            </svg>
            <div className="pr-3">تماس با پشتیبانی</div>
          </div>
          <p className="mt-4 text-sm leading-8 text-[var(--color-neutral-650)]">
            {`شما می‌توانید از طریق تماس با شماره تلفن ${SUPPORT_PHONE_DISPLAY} با کارشناسان ${siteConfig.nameFa} در ارتباط باشید`}
          </p>
          <div className="mt-4 text-left md:mt-4">
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="inline-block rounded-xl bg-[#2a75bb] px-4 py-2 text-sm text-white"
            >
              تماس تلفنی
            </a>
          </div>
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-[300px] flex-col justify-between rounded-xl border border-[var(--color-neutral-200)] p-6 shadow-sm md:mt-0">
          <div>
            <div className="flex items-center font-bold text-[#28c76f]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 18 18"
                stroke="#28C76F"
                className="shrink-0"
                aria-hidden
              >
                <g stroke="currentColor" strokeWidth="1.5" clipPath="url(#enquiry-mail)">
                  <path
                    strokeLinejoin="round"
                    d="m3.75 5.25-.914.61c-.655.436-.983.655-1.16.988-.178.333-.177.724-.174 1.507a133 133 0 0 0 .036 2.876c.058 2.306.087 3.459.934 4.306.848.848 2.017.877 4.354.936a87 87 0 0 0 4.349 0c2.337-.059 3.505-.088 4.353-.936s.877-2 .934-4.306c.024-.972.033-1.933.037-2.876.002-.783.003-1.174-.174-1.507-.178-.333-.505-.552-1.16-.989l-.915-.609"
                  />
                  <path
                    strokeLinejoin="round"
                    d="m1.5 7.5 5.185 3.11c1.128.678 1.692 1.016 2.315 1.016s1.187-.338 2.315-1.015L16.5 7.5"
                  />
                  <path d="M3.75 9V4.5c0-1.414 0-2.121.44-2.56.439-.44 1.146-.44 2.56-.44h4.5c1.414 0 2.121 0 2.56.44.44.439.44 1.146.44 2.56V9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 7.5h3m-3-3h3"
                  />
                </g>
                <defs>
                  <clipPath id="enquiry-mail">
                    <path fill="#fff" d="M0 0h18v18H0z" />
                  </clipPath>
                </defs>
              </svg>
              <div className="pr-3">ارسال ایمیل</div>
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--color-neutral-650)]">
              {`جهت ارسال درخواست استعلام می‌توانید از طریق ایمیل زیر اقدام فرمایید: ${SUPPORT_EMAIL}`}
            </p>
          </div>
          <div className="mt-4 text-left md:mt-4">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-block rounded-xl bg-[#2a75bb] px-4 py-2 text-sm text-white"
            >
              ارسال ایمیل
            </a>
          </div>
        </div>

        <div className="mx-auto mt-4 w-full max-w-[300px] rounded-xl border border-[var(--color-neutral-200)] p-6 shadow-sm md:mt-0">
          <div className="flex items-center font-bold text-[#28c76f]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              fill="none"
              viewBox="0 0 24 25"
              stroke="#28C76F"
              className="shrink-0"
              aria-hidden
            >
              <path
                fill="#28C76F"
                d="m7.97 8.658.963-.272a1 1 0 0 0-1.962.272zm-5.857.986.931-.366zm19.774 0-.931-.366zm-5.858-.986h1a1 1 0 0 0-1.962-.272zM2.458 7.784l.854.52zm.963-1.586-.854-.52zm18.121 1.586-.854.52zm-.963-1.586.854-.52zm1.408 2.677-.996.087zm-19.974 0-.996-.088zm5.958-.217h-1c0 .96-.847 1.842-2.022 1.842v2c2.162 0 4.022-1.663 4.022-3.842zM4.949 11.5v-1c-.906 0-1.635-.536-1.905-1.222l-.93.366-.931.365c.582 1.482 2.07 2.491 3.766 2.491zm16.938-1.856-.931-.366c-.27.686-.999 1.222-1.905 1.222v2c1.695 0 3.184-1.01 3.766-2.49zM19.05 11.5v-1c-1.175 0-2.022-.882-2.022-1.842h-2c0 2.179 1.86 3.842 4.022 3.842zM12 11.5v-1c-1.536 0-2.739-.952-3.067-2.114l-.962.272-.963.272c.596 2.107 2.65 3.57 4.992 3.57zm4.03-2.842-.963-.272C14.739 9.548 13.537 10.5 12 10.5v2c2.341 0 4.396-1.463 4.992-3.57zM2.457 7.784l.854.52.964-1.587-.855-.519-.854-.52-.964 1.587zm19.084 0 .855-.52-.964-1.585-.854.52-.855.518.964 1.586zM5.915 2.5v1h12.17v-2H5.915zM20.06 4.356h1c0-1.634-1.39-2.856-2.974-2.856v2c.596 0 .974.44.974.856zm.52 1.842.854-.52a2.54 2.54 0 0 1-.374-1.322h-2c0 .832.23 1.647.665 2.361zM3.94 4.356h1c0-.416.378-.856.974-.856v-2c-1.584 0-2.974 1.222-2.974 2.856zm17.946 5.288.93.365c.041-.105.116-.286.155-.517.038-.23.033-.458.011-.705l-.996.088-.996.087c.015.172.006.211.008.204.001-.01.007-.017-.043.112zm-.345-1.86-.854.52c.146.24.21.348.25.44a.6.6 0 0 1 .053.218l.996-.087.996-.088c-.06-.678-.32-1.084-.586-1.522zM3.422 6.198l.854.52a4.54 4.54 0 0 0 .665-2.362h-2c0 .46-.127.916-.374 1.323zM2.112 9.644l.931-.366c-.05-.129-.044-.122-.043-.113s-.007-.03.008-.203l-.996-.087-.996-.088c-.022.247-.027.476.011.705.038.23.114.412.155.517zm.345-1.86-.855-.52c-.266.44-.527.845-.586 1.523l.996.088.996.087a.6.6 0 0 1 .053-.217c.04-.093.104-.2.25-.442z"
              />
              <path
                stroke="#28C76F"
                strokeLinecap="round"
                strokeWidth="2"
                d="M3 11v4.5c0 2.828 0 4.243.879 5.121.878.879 2.293.879 5.121.879h4M7 17.5h4"
              />
              <path
                stroke="#28C76F"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.5 14c1.933 0 3.5 1.538 3.5 3.434 0 2.146-2.116 3.2-3.125 4.809-.215.343-.52.343-.75 0C17.085 20.696 15 19.535 15 17.434 15 15.538 16.567 14 18.5 14Z"
              />
              <path
                stroke="#28C76F"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.5 17.5h.009"
              />
            </svg>
            <div className="pr-3">مراجعه حضوری</div>
          </div>
          <p className="mt-4 text-sm leading-8 text-[var(--color-neutral-650)]">
            {`شما می‌توانید با مراجعه حضوری به دفتر ${siteConfig.nameFa} از نزدیک با خدمات و نحوه کار آشنا شوید.`}
          </p>
          <div className="mt-4 text-left md:mt-4">
            <Link
              href="/page/contact-us"
              className="inline-block rounded-xl bg-[#2a75bb] px-4 py-2 text-sm text-white"
            >
              آدرس و نقشه
            </Link>
          </div>
        </div>
      </div>

      {/* Process — barghchi stepped flow (no page scrollbars) */}
      <section className="mt-12 max-w-full overflow-hidden bg-[#f2f4fc] py-16">
        <div className="relative mb-10 text-center md:mb-12">
          <span
            className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-px -translate-y-1/2 bg-[#d5e0ef]"
            aria-hidden
          />
          <h2 className="relative z-10 inline-block bg-[#f2f4fc] px-4 text-base font-bold text-[#2a75bb] md:text-xl">
            فرایند استعلام قیمت و تامین کالا
          </h2>
        </div>
        <div className="site-container">
          <ol className="mx-auto flex flex-col items-stretch gap-6 md:flex-row md:items-start md:justify-between md:gap-1 lg:gap-2">
            {PROCESS_STEPS.map((step, i) => {
              const isInfo = step.tone === "info";
              const isLast = i === PROCESS_STEPS.length - 1;
              return (
                <li
                  key={step.title}
                  className="relative flex min-w-0 flex-1 flex-col items-center md:items-stretch"
                >
                  <div className="flex w-full items-center justify-center gap-1 md:justify-start md:gap-1.5">
                    <div
                      className={[
                        "flex h-[72px] w-full max-w-[11.5rem] flex-1 items-center justify-center gap-1.5 rounded-2xl p-2 text-center text-xs font-bold shadow-sm sm:h-[90px] sm:text-sm lg:max-w-none",
                        isInfo
                          ? "border border-[#00bad1] bg-[#ebfafc] text-[#00bad1]"
                          : "border border-[var(--color-neutral-300)] bg-white text-[#2a75bb]",
                      ].join(" ")}
                    >
                      <ProcessIcon icon={step.icon} />
                      <span className="leading-snug">{step.title}</span>
                    </div>
                    {!isLast ? (
                      <span className="hidden shrink-0 md:inline-flex">
                        <ProcessArrow tone={step.tone} />
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-center text-sm text-[var(--color-neutral-650)] md:max-w-[11.5rem] lg:max-w-none">
                    {step.subtitle}
                  </p>
                  {!isLast ? (
                    <span
                      className="mt-2 flex justify-center text-[#00bad1] md:hidden"
                      aria-hidden
                    >
                      ↓
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Services — image + accordion (barghchi layout) */}
      <SectionHeading>{`${siteConfig.nameFa} چه خدماتی ارائه می‌دهد؟`}</SectionHeading>
      <div className="site-container">
        <div className="grid gap-6 md:grid-cols-2">
          <ServicesImage />

          <div>
            <p className="mb-6 mt-8 font-bold text-[var(--color-neutral-900)] md:mt-0">
              {`ما در ${siteConfig.nameFa} به دنبال ارائه بهترین خدمات هستیم`}
            </p>
            <div className="mt-6">
              {SERVICE_ITEMS.map((item) => {
                const open = Boolean(openServices[item.id]);
                return (
                  <div
                    key={item.id}
                    className="w-full overflow-hidden border-b border-[var(--color-neutral-200)] bg-white py-4"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-xs font-bold md:text-sm"
                      aria-expanded={open}
                      onClick={() =>
                        setOpenServices((cur) => ({
                          ...cur,
                          [item.id]: !cur[item.id],
                        }))
                      }
                    >
                      <span className="flex items-center gap-2 text-[#2a75bb]">
                        <ServiceIcon icon={item.icon} />
                        <span>{item.title}</span>
                      </span>
                      <Chevron open={open} />
                    </button>
                    <div
                      className={[
                        "overflow-hidden px-5 transition-all duration-200",
                        open ? "h-fit py-5" : "h-0 py-0",
                      ].join(" ")}
                    >
                      {open ? (
                        <p className="text-justify text-sm leading-8 text-[var(--color-neutral-650)]">
                          {item.body}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Brands rail */}
      <SectionHeading>برخی از برندهای ما</SectionHeading>
      <div className="relative mx-auto max-w-[1200px]">
        <div className="overflow-hidden">
          <div
            className="flex w-max gap-5 transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${brandOffset}px, 0, 0)` }}
          >
            {SHOWCASE_BRANDS.slice(0, 16).map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="flex h-[110px] w-[180px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--color-neutral-100)] bg-white px-3"
                title={brand.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-[70px] max-w-full object-contain grayscale transition hover:grayscale-0"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
        <div dir="ltr" className="mt-4 flex justify-between">
          <button
            type="button"
            aria-label="بعدی"
            className="rounded-md bg-white px-3 py-2 shadow-sm"
            onClick={() => setBrandIndex((i) => i + 1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="قبلی"
            className="rounded-md bg-white px-3 py-2 shadow-sm"
            onClick={() => setBrandIndex((i) => Math.max(0, i - 1))}
          >
            ›
          </button>
        </div>
      </div>

      {/* Customers rail — barghchi-style logo carousel */}
      <SectionHeading>برخی از مشتریان ما</SectionHeading>
      <div className="site-container relative mx-auto max-w-[1320px]">
        <div className="overflow-hidden">
          <div
            className="flex w-max items-center gap-5 transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${customerOffset}px, 0, 0)` }}
          >
            {CUSTOMER_LOGOS.map((customer) => (
              <div
                key={customer.id}
                className="flex w-[200px] shrink-0 items-center justify-center overflow-hidden"
              >
                <CustomerLogo name={customer.name} src={customer.src} />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute left-0 right-0 top-0 z-10 mt-0 flex justify-between md:top-5">
          <button
            type="button"
            aria-label="بعدی"
            className="z-10 rounded-md bg-white px-3 py-2 shadow-sm"
            onClick={() =>
              setCustomerIndex((i) => Math.min(customerMaxIndex, i + 1))
            }
          >
            <CarouselChevron flipped />
          </button>
          <button
            type="button"
            aria-label="قبلی"
            className="z-10 rounded-md bg-white px-3 py-2 shadow-sm"
            onClick={() => setCustomerIndex((i) => Math.max(0, i - 1))}
          >
            <CarouselChevron />
          </button>
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[var(--color-neutral-900)] px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
