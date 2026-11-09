import { DigiModulePlaceholder } from "@/components/seller/digi/DigiModulePlaceholder";

export default function DigiSellerShippingPage() {
  return (
    <DigiModulePlaceholder
      title="ارسال و انبار"
      description="تنظیم روش ارسال، انبار و موجودی تنوع‌ها"
      highlights={[
        "تعریف روش‌های ارسال فروشگاه",
        "مدیریت موجودی تنوع‌ها در انبار",
        "پیگیری تعهد زمان ارسال سفارش",
      ]}
      primaryHref="/seller/digi/inventory"
      primaryLabel="موجودی و قیمت"
    />
  );
}
