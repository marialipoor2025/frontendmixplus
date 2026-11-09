import { SellerModulePlaceholder } from "@/components/seller/SellerModulePlaceholder";

export default function SellerAnalyticsPage() {
  return (
    <SellerModulePlaceholder
      title="تحلیل عملکرد"
      description="فروش، نرخ تبدیل، موجودی و امتیاز عملکرد فروشگاه"
      moduleOwner="Sellers + Catalog + Cart (read models)"
      highlights={[
        "گزارش فروش روزانه/هفتگی/ماهانه",
        "محصولات پرفروش و هشدار ناموجودی",
        "شاخص‌های ارسال به‌موقع و مرجوعی (پس از تکمیل سفارش فروشنده)",
        "میز کار فعلی آمار کاتالوگ را نشان می‌دهد؛ گزارش‌های عمیق‌تر بعداً اضافه می‌شوند",
      ]}
      primaryHref="/seller/dashboard"
      primaryLabel="بازگشت به میز کار"
    />
  );
}