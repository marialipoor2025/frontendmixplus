/**
 * Digikala seller product create flow — /pwa/product/create/1
 * Steps (RTL): دسته‌بندی → اطلاعات کلی → مشخصات → عنوان → عکس
 */
export type DigiCreateStepId =
  | "category"
  | "general"
  | "specs"
  | "title"
  | "gallery";

export type DigiCreateStepDef = {
  id: DigiCreateStepId;
  title: string;
  hint: string;
};

export const DIGI_CREATE_STEPS: DigiCreateStepDef[] = [
  {
    id: "category",
    title: "دسته‌بندی",
    hint: "لطفا یک دسته‌بندی انتخاب کنید",
  },
  {
    id: "general",
    title: "اطلاعات کلی",
    hint: "برند و وضعیت کالا را مشخص کنید",
  },
  {
    id: "specs",
    title: "مشخصات",
    hint: "ویژگی‌های فنی کالا را وارد کنید",
  },
  {
    id: "title",
    title: "عنوان",
    hint: "عنوان و آدرس صفحه محصول را بنویسید",
  },
  {
    id: "gallery",
    title: "عکس",
    hint: "تصاویر کالا را مطابق استاندارد بارگذاری کنید",
  },
];

export function digiStepIndex(id: DigiCreateStepId): number {
  return DIGI_CREATE_STEPS.findIndex((s) => s.id === id);
}

export function nextDigiStep(
  id: DigiCreateStepId,
): DigiCreateStepId | null {
  const i = digiStepIndex(id);
  if (i < 0 || i >= DIGI_CREATE_STEPS.length - 1) return null;
  return DIGI_CREATE_STEPS[i + 1]!.id;
}

export function prevDigiStep(
  id: DigiCreateStepId,
): DigiCreateStepId | null {
  const i = digiStepIndex(id);
  if (i <= 0) return null;
  return DIGI_CREATE_STEPS[i - 1]!.id;
}

export function parseDigiStep(
  raw: string | null | undefined,
): DigiCreateStepId {
  const found = DIGI_CREATE_STEPS.find((s) => s.id === raw);
  return found?.id ?? "category";
}
