"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createSellerProduct,
  getSellerProductWizard,
  publishSellerProduct,
  saveSellerProductBasics,
  saveSellerProductDescription,
  saveSellerProductMedia,
  saveSellerProductPricing,
  saveSellerProductSpecs,
  saveSellerProductVariants,
} from "@/lib/api/seller-wizard";
import {
  ensureDraft,
  loadDraft,
  markStep,
  removeDraft,
  saveDraft,
} from "@/lib/seller/wizard-draft";
import {
  nextStepId,
  parseStepId,
  prevStepId,
  SELLER_WIZARD_STEPS,
} from "@/lib/seller/wizard-steps";
import type { ProductMediaItem } from "@/types/admin-product";
import type { ProductSpecGroup } from "@/types/product-detail";
import type {
  SellerProductBasics,
  SellerProductDescription,
  SellerProductDraft,
  SellerProductPricing,
  SellerProductVariants,
  SellerWizardStepId,
} from "@/types/seller-wizard";
import { normalizeStepStatus } from "@/types/seller-wizard";
import { WizardStepper } from "./WizardStepper";
import { BasicsStep } from "./steps/BasicsStep";
import { ExpertReviewStep } from "./steps/ExpertReviewStep";
import { FeaturesStep } from "./steps/FeaturesStep";
import { GalleryStep } from "./steps/GalleryStep";
import { IntroStep } from "./steps/IntroStep";
import { PreviewStep } from "./steps/PreviewStep";
import { PricingStep } from "./steps/PricingStep";
import { SpecsStep } from "./steps/SpecsStep";
import { VariantsStep } from "./steps/VariantsStep";

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initialStep?: string | null;
};

export function ProductWizard({ mode, productId, initialStep }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<SellerWizardStepId>(parseStepId(initialStep));
  const [draft, setDraft] = useState<SellerProductDraft | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setLoading(true);
      setBootError(null);
      try {
        if (mode === "create") {
          const id = productId;
          const local = id && loadDraft(id) ? loadDraft(id)! : ensureDraft(id);
          if (!cancelled) {
            setDraft({
              ...local,
              stepStatus: normalizeStepStatus(local.stepStatus),
            });
            setStep(parseStepId(initialStep));
            softSyncUrl(local.id, parseStepId(initialStep), true);
          }
          return;
        }

        if (!productId) throw new Error("شناسه محصول نامعتبر است");
        const local = loadDraft(productId);
        try {
          const remote = await getSellerProductWizard(productId);
          const merged = saveDraft({
            ...remote,
            description:
              local?.stepStatus.intro === "draft" ||
              local?.stepStatus.features === "draft" ||
              local?.stepStatus.expertReview === "draft"
                ? local.description
                : remote.description,
            variants:
              local?.stepStatus.variants === "draft"
                ? local.variants
                : remote.variants,
            specs:
              local?.stepStatus.specs === "draft" ? local.specs : remote.specs,
            stepStatus: normalizeStepStatus({
              ...remote.stepStatus,
              ...(local?.stepStatus ?? {}),
            }),
          });
          if (!cancelled) {
            setDraft(merged);
            setStep(parseStepId(initialStep));
          }
        } catch {
          if (local && !cancelled) {
            setDraft({
              ...local,
              stepStatus: normalizeStepStatus(local.stepStatus),
            });
            setStep(parseStepId(initialStep));
          } else throw new Error("محصول یافت نشد");
        }
      } catch (err) {
        if (!cancelled) {
          setBootError(err instanceof Error ? err.message : "خطا در بارگذاری");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, productId]);

  function softSyncUrl(
    id: string,
    next: SellerWizardStepId,
    isCreate: boolean,
  ) {
    if (typeof window === "undefined") return;
    const path =
      isCreate || id.startsWith("draft-")
        ? `/seller/products/new?draft=${encodeURIComponent(id)}&step=${next}`
        : `/seller/products/${encodeURIComponent(id)}/manage?step=${next}`;
    window.history.replaceState(window.history.state, "", path);
  }

  function go(next: SellerWizardStepId) {
    setStep(next);
    if (draft) {
      softSyncUrl(
        draft.id,
        next,
        mode === "create" || draft.isLocalOnly || draft.id.startsWith("draft-"),
      );
    }
  }

  function goNext() {
    const n = nextStepId(step);
    if (n) go(n);
  }

  function goBack() {
    const p = prevStepId(step);
    if (p) go(p);
  }

  function skipCurrent() {
    if (!draft || step === "preview") {
      goNext();
      return;
    }
    setDraft(markStep(draft, step, "skipped"));
    goNext();
  }

  async function persistBasics(basics: SellerProductBasics) {
    if (!draft) return;
    const result =
      draft.isLocalOnly
        ? await createSellerProduct(draft, basics)
        : await saveSellerProductBasics(draft, basics);
    const next = markStep(result, "basics", "saved");
    setDraft(next);
    if (draft.isLocalOnly && !result.isLocalOnly) {
      removeDraft(draft.id);
      router.replace(
        `/seller/products/${encodeURIComponent(result.id)}/manage?step=gallery`,
      );
      return;
    }
    goNext();
  }

  async function persistGallery(gallery: ProductMediaItem[]) {
    if (!draft) return;
    if (draft.isLocalOnly) {
      setDraft(markStep(saveDraft({ ...draft, gallery }), "gallery", "draft"));
      throw new Error(
        "ابتدا اطلاعات پایه را ذخیره کنید تا محصول روی سرور ساخته شود",
      );
    }
    const result = await saveSellerProductMedia(draft.id, gallery);
    setDraft(markStep(result, "gallery", "saved"));
    goNext();
  }

  async function persistPricing(pricing: SellerProductPricing) {
    if (!draft) return;
    const result = await saveSellerProductPricing(draft, pricing);
    setDraft(markStep(result, "pricing", "saved"));
    goNext();
  }

  async function persistVariants(variants: SellerProductVariants) {
    if (!draft) return;
    const result = await saveSellerProductVariants(draft, variants);
    setDraft(markStep(result, "variants", "saved"));
    goNext();
  }

  async function persistSpecs(specs: ProductSpecGroup[]) {
    if (!draft) return;
    const result = await saveSellerProductSpecs(draft, specs);
    setDraft(markStep(result, "specs", "saved"));
    goNext();
  }

  async function persistDescriptionPart(
    stepId: "features" | "intro" | "expertReview",
    description: SellerProductDescription,
  ) {
    if (!draft) return;
    const result = await saveSellerProductDescription(
      { ...draft, description },
      description,
    );
    setDraft(markStep(result, stepId, "saved"));
    goNext();
  }

  async function persistPublish(publish: boolean) {
    if (!draft) return;
    const result = await publishSellerProduct(draft, publish);
    setDraft(markStep(result, "preview", "saved"));
    router.push("/seller/dashboard");
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        در حال آماده‌سازی ویزارد محصول…
      </p>
    );
  }

  if (bootError || !draft) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700">{bootError ?? "خطا"}</p>
        <Link href="/seller/dashboard" className="text-sm text-[var(--color-primary)]">
          بازگشت به محصولات
        </Link>
      </div>
    );
  }

  const meta = SELLER_WIZARD_STEPS.find((s) => s.id === step);
  const stepNo = SELLER_WIZARD_STEPS.findIndex((s) => s.id === step) + 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/seller/dashboard" className="text-xs text-[var(--color-primary)]">
            ← محصولات من
          </Link>
          <h1 className="mt-1 text-lg font-bold text-[var(--color-neutral-900)]">
            {mode === "create" || draft.isLocalOnly
              ? "افزودن محصول جدید"
              : "مدیریت محصول"}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {draft.basics.title || "پیش‌نویس بدون عنوان"}
            {draft.isLocalOnly ? " · فقط محلی" : ""}
          </p>
        </div>
        <p className="text-[11px] text-[var(--color-muted)]">
          بخش {stepNo} از {SELLER_WIZARD_STEPS.length}
          {meta ? ` — ${meta.title}` : ""}
        </p>
      </div>

      <div className="space-y-4">
        <WizardStepper current={step} draft={draft} onSelect={go} />
        <div className="min-w-0">
          <div className={step === "basics" ? "" : "hidden"} aria-hidden={step !== "basics"}>
            <BasicsStep draft={draft} onSave={persistBasics} onSkip={skipCurrent} />
          </div>
          <div className={step === "gallery" ? "" : "hidden"} aria-hidden={step !== "gallery"}>
            <GalleryStep
              draft={draft}
              onSave={persistGallery}
              onBack={goBack}
              onSkip={skipCurrent}
            />
          </div>
          <div className={step === "variants" ? "" : "hidden"} aria-hidden={step !== "variants"}>
            <VariantsStep
              draft={draft}
              onSave={persistVariants}
              onBack={goBack}
              onSkip={skipCurrent}
            />
          </div>
          <div className={step === "features" ? "" : "hidden"} aria-hidden={step !== "features"}>
            <FeaturesStep
              draft={draft}
              onSave={(d) => persistDescriptionPart("features", d)}
              onBack={goBack}
              onSkip={skipCurrent}
            />
          </div>
          <div className={step === "pricing" ? "" : "hidden"} aria-hidden={step !== "pricing"}>
            <PricingStep
              draft={draft}
              onSave={persistPricing}
              onBack={goBack}
              onSkip={skipCurrent}
            />
          </div>
          <div className={step === "specs" ? "" : "hidden"} aria-hidden={step !== "specs"}>
            <SpecsStep
              draft={draft}
              onSave={persistSpecs}
              onBack={goBack}
              onSkip={skipCurrent}
            />
          </div>
          <div className={step === "intro" ? "" : "hidden"} aria-hidden={step !== "intro"}>
            <IntroStep
              draft={draft}
              onSave={(d) => persistDescriptionPart("intro", d)}
              onBack={goBack}
              onSkip={skipCurrent}
            />
          </div>
          <div
            className={step === "expertReview" ? "" : "hidden"}
            aria-hidden={step !== "expertReview"}
          >
            <ExpertReviewStep
              draft={draft}
              onSave={(d) => persistDescriptionPart("expertReview", d)}
              onBack={goBack}
              onSkip={skipCurrent}
            />
          </div>
          <div className={step === "preview" ? "" : "hidden"} aria-hidden={step !== "preview"}>
            <PreviewStep
              draft={draft}
              onPublish={persistPublish}
              onBack={goBack}
              onJump={go}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
