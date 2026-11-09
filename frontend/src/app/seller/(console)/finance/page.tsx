import { SellerModulePlaceholder } from "@/components/seller/SellerModulePlaceholder";

export default function SellerFinancePage() {
  return (
    <SellerModulePlaceholder
      title="مالی و تسویه"
      description="صورت‌حساب‌ها، کیف پول فروشنده و درخواست تسویه"
      moduleOwner="Finance (آینده) + Cart (پرداخت سفارش)"
      highlights={[
        "خلاصه مطالبات و مانده قابل تسویه",
        "صورت‌حساب دوره‌ای و جرایم احتمالی",
        "تاریخچه پرداخت‌ها و وضعیت هر درخواست تسویه",
        "در این فاز فقط اسکلت UI هم‌راستا با معماری ماژولار اضافه شده است",
      ]}
      primaryHref="/seller/orders"
      primaryLabel="مشاهده سفارش‌ها"
    />
  );
}
