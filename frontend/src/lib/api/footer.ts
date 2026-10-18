import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";

export type FooterTrustSeal = {
  label: string;
  src: string;
  visible: boolean;
};

export type FooterPartner = {
  label: string;
  href: string;
  icon: string;
  visible: boolean;
};

export type FooterSettings = {
  showTrustSeals: boolean;
  showPartners: boolean;
  trustSeals: FooterTrustSeal[];
  partners: FooterPartner[];
  phonePrimary: string;
  phoneSecondary: string;
  hoursLine: string;
  headerHours: string;
  headerPhone: string;
  headerPhoneTel: string;
};

const defaults: FooterSettings = {
  showTrustSeals: true,
  showPartners: true,
  phonePrimary: "تلفن پشتیبانی ۶۱۹۳۰۰۰۰ - ۰۲۱",
  phoneSecondary: "۰۲۱-۹۱۰۰۰۱۰۰",
  hoursLine: "۷ روز هفته، ۲۴ ساعته پاسخگوی شما هستیم",
  headerHours: "از ساعت ۹ تا ۱۷ در روزهای کاری پاسخگوی شما هستیم",
  headerPhone: "۰۲۱-۶۱۹۳۰۰۰۰",
  headerPhoneTel: "+982161930000",
  trustSeals: [
    {
      label: "نماد کسب و کارهای مجازی",
      src: "/images/footer/nemads/kasbokar.webp",
      visible: true,
    },
    {
      label: "نشان ملی ثبت",
      src: "/images/footer/nemads/rezi.webp",
      visible: true,
    },
    {
      label: "سامانه پایش",
      src: "/images/footer/nemads/sapra.webp",
      visible: true,
    },
  ],
  partners: [],
};

function enabled() {
  return !siteConfig.useMocks && Boolean(siteConfig.apiBaseUrl);
}

function withContactDefaults(settings: FooterSettings): FooterSettings {
  return {
    ...defaults,
    ...settings,
    phonePrimary: settings.phonePrimary || defaults.phonePrimary,
    phoneSecondary: settings.phoneSecondary || defaults.phoneSecondary,
    hoursLine: settings.hoursLine || defaults.hoursLine,
    headerHours: settings.headerHours || defaults.headerHours,
    headerPhone: settings.headerPhone || defaults.headerPhone,
    headerPhoneTel: settings.headerPhoneTel || defaults.headerPhoneTel,
    trustSeals: settings.trustSeals?.length
      ? settings.trustSeals
      : defaults.trustSeals,
    partners: settings.partners ?? defaults.partners,
  };
}

export async function getFooterSettings(): Promise<FooterSettings> {
  if (!enabled()) return defaults;
  try {
    const live = await apiClient<FooterSettings>("/api/merchandising/footer");
    return withContactDefaults(live);
  } catch {
    return defaults;
  }
}

export async function getAdminFooterSettings(): Promise<FooterSettings> {
  if (!enabled()) return defaults;
  const live = await apiClient<FooterSettings>(
    "/api/admin/merchandising/footer",
    {
      auth: true,
    },
  );
  return withContactDefaults(live);
}

export async function saveAdminFooterSettings(
  settings: FooterSettings,
): Promise<FooterSettings> {
  if (!enabled()) return settings;
  return apiClient<FooterSettings>("/api/admin/merchandising/footer", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(settings),
  });
}

export async function subscribeFooterEmail(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) throw new Error("ایمیل را وارد کنید");
  if (!enabled()) {
    // Mock: persist locally so the form still feels real.
    const key = "mixplus.newsletter";
    const prev = JSON.parse(
      typeof window !== "undefined"
        ? window.localStorage.getItem(key) || "[]"
        : "[]",
    ) as string[];
    if (!prev.includes(trimmed)) {
      prev.push(trimmed);
      window.localStorage.setItem(key, JSON.stringify(prev));
    }
    return;
  }

  await apiClient("/api/merchandising/newsletter", {
    method: "POST",
    body: JSON.stringify({ email: trimmed }),
  });
}
