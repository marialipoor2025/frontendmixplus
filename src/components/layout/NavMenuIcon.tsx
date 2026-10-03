import {
  AmazingIcon,
  BrandsIcon,
  GiftIcon,
  InstallmentIcon,
  InvoiceDocIcon,
  OpenBoxIcon,
  OrgPurchaseIcon,
  SellerShopIcon,
  TrendIcon,
  WrenchServiceIcon,
} from "@/components/layout/icons";
import { NAV_ICON_CLASS } from "@/components/layout/navMenuShared";

export function NavMenuIcon({
  name,
  className = NAV_ICON_CLASS,
}: {
  name?: string;
  className?: string;
}) {
  switch (name) {
    case "amazing":
      return <AmazingIcon className={className} />;
    case "brands":
      return <BrandsIcon className={className} />;
    case "trend":
      return <TrendIcon className={className} />;
    case "service":
      return <WrenchServiceIcon className={className} />;
    case "b2b":
      return <OrgPurchaseIcon className={className} />;
    case "gift":
      return <GiftIcon className={className} />;
    case "stock":
      return <OpenBoxIcon className={className} />;
    case "installment":
      return <InstallmentIcon className={className} />;
    case "seller":
      return <SellerShopIcon className={className} />;
    case "invoice":
      return <InvoiceDocIcon className={className} />;
    default:
      return null;
  }
}
