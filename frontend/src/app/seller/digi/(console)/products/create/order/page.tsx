import { DigiModulePlaceholder } from "@/components/seller/digi/DigiModulePlaceholder";

export default function DigiProductCreateOrderPage() {
  return (
    <DigiModulePlaceholder
      title="سفارش ثبت کالا توسط دیجی‌کالا"
      description="سپردن تولید محتوا به تیم محتوا — این مسیر به‌زودی فعال می‌شود. فعلاً می‌توانید کالا را خودتان ثبت کنید."
      highlights={[
        "تضمین تأیید محتوا",
        "صرفه‌جویی در زمان",
        "خروجی استاندارد برای کاتالوگ",
      ]}
      primaryHref="/seller/digi/products/new"
      primaryLabel="ثبت کالا توسط فروشنده"
    />
  );
}
