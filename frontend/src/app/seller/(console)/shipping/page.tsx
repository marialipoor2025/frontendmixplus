import { SellerModulePlaceholder } from "@/components/seller/SellerModulePlaceholder";

export default function SellerShippingPage() {
  return (
    <SellerModulePlaceholder
      title="ارسال و انبار"
      description="محموله‌ها، تعهد ارسال و موجودی انبار — هم‌تراز منوی Digikala Seller Center"
      moduleOwner="Cart (سفارش) + Catalog (موجودی)"
      highlights={[
        "ایجاد محموله از سفارش‌های دارای تعهد ارسال",
        "پیگیری وضعیت تحویل به انبار یا ارسال فروشنده",
        "گزارش موجودی تنوع‌ها از مسیر کالا / موجودی",
        "در این فاز اسکلت UX و لینک به سفارش‌ها و موجودی فعال است",
      ]}
      primaryHref="/seller/orders"
      primaryLabel="رفتن به سفارش‌ها"
    />
  );
}
