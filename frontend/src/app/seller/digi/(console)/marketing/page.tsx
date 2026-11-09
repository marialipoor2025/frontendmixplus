import { DigiModulePlaceholder } from "@/components/seller/digi/DigiModulePlaceholder";

export default function DigiSellerMarketingPage() {
  return (
    <DigiModulePlaceholder
      title="بازاریابی و تبلیغات"
      description="پروموشن، کمپین و پیشنهاد شگفت‌انگیز"
      highlights={[
        "ساخت کمپین تخفیف روی کالاهای فعال",
        "پیشنهاد شگفت‌انگیز",
        "تبلیغات افزایش بازدید کالا",
      ]}
      primaryHref="/seller/digi/products"
      primaryLabel="مدیریت کالا"
    />
  );
}
