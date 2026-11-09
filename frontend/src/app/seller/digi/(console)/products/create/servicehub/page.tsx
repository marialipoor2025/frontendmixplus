import { DigiModulePlaceholder } from "@/components/seller/digi/DigiModulePlaceholder";

export default function DigiProductCreateServiceHubPage() {
  return (
    <DigiModulePlaceholder
      title="ثبت کالا توسط سرویس‌هاب"
      description="ساخت انبوه و انتقال محصولات از سرویس‌دهنده‌ها به‌زودی فعال می‌شود."
      highlights={[
        "ساخت انبوه محصولات",
        "انتقال از سایت‌های دیگر",
        "ویرایش تصویر",
      ]}
      primaryHref="/seller/digi/products/new"
      primaryLabel="ثبت کالا توسط فروشنده"
    />
  );
}