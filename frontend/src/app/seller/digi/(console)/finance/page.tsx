import { DigiModulePlaceholder } from "@/components/seller/digi/DigiModulePlaceholder";

export default function DigiSellerFinancePage() {
  return (
    <DigiModulePlaceholder
      title="مالی"
      description="تراکنش‌ها، صورتحساب‌ها و تسویه فروشنده"
      highlights={[
        "خلاصه مطالبات و مانده قابل تسویه",
        "صورت‌حساب دوره‌ای",
        "تاریخچه پرداخت‌ها و وضعیت درخواست تسویه",
      ]}
      primaryHref="/seller/digi/orders"
      primaryLabel="مشاهده سفارش‌ها"
    />
  );
}
