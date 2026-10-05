import { StaticInfoPage } from "@/components/content/StaticInfoPage";
import { getMainNavData } from "@/lib/api/nav";
import { STATIC_PAGES } from "@/lib/static-pages";

const page = STATIC_PAGES.blog;

export const metadata = { title: page.title };

export default async function BlogPage() {
  const nav = await getMainNavData();
  return (
    <StaticInfoPage
      nav={nav}
      title={page.title}
      description={page.description}
    >
      <ul className="space-y-3">
        {[
          "راهنمای خرید یخچال ساید بای ساید",
          "تفاوت لباسشویی‌های ۸ و ۹ کیلویی",
          "چطور تلویزیون مناسب اتاق نشیمن انتخاب کنیم؟",
        ].map((title) => (
          <li
            key={title}
            className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-neutral-800)]"
          >
            {title}
          </li>
        ))}
      </ul>
    </StaticInfoPage>
  );
}
