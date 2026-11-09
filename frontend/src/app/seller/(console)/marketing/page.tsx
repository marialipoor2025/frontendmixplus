import { SellerModulePlaceholder } from "@/components/seller/SellerModulePlaceholder";

export default function SellerMarketingPage() {
  return (
    <SellerModulePlaceholder
      title="بازاریابی و تبلیغات"
      description="نامزدی شگفت‌انگیز، پروموشن‌ها و ابزار رشد فروش"
      moduleOwner="Promotions"
      highlights={[
        "نامزدی پیشنهاد شگفت‌انگیز از ویزارد محصول هم‌اکنون فعال است",
        "کمپین‌های تبلیغاتی و کوپن‌های فروشنده در فازهای بعدی",
        "هم‌راستا با پنل ادمین پروموشن و آفر فروشندگان",
      ]}
      primaryHref="/seller/products"
      primaryLabel="مدیریت محصولات"
    />
  );
}
