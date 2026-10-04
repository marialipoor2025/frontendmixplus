import { InfoFilledIcon } from "@/components/layout/icons";

type ProductReturnNoticeProps = {
  text: string;
};

/**
 * Category return-policy tip under highlighted features.
 */
export function ProductReturnNotice({ text }: ProductReturnNoticeProps) {
  return (
    <div className="my-3 rounded-[var(--global-radius)]">
      <div className="flex">
        <div className="mt-1 flex shrink-0">
          <InfoFilledIcon className="size-[18px] text-[var(--color-icon-neutral-hint)]" />
        </div>
        <span className="mr-2 text-[13px] leading-[1.8] text-[var(--color-neutral-500)]">
          {text}
        </span>
      </div>
    </div>
  );
}
