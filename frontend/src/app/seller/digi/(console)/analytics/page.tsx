import { DigiModulePlaceholder } from "@/components/seller/digi/DigiModulePlaceholder";

export default function DigiSellerAnalyticsPage() {
  return (
    <DigiModulePlaceholder
      title="تحلیل عملکرد"
      description="فروش، درآمد، مرجوعی و کیفیت"
      highlights={[
        "نمودار فروش و درآمد دوره‌ای",
        "کالاهای پرفروش و کم‌بازدید",
        "نرخ مرجوعی و شاخص کیفیت",
      ]}
      primaryHref="/seller/digi/dashboard"
      primaryLabel="بازگشت به خانه"
    />
  );
}