import {
  CommunityIcon,
  GiftIcon,
  HomeOutlineIcon,
  InvoiceDocIcon,
  LocationPinIcon,
  LoginUserIcon,
  NotificationIcon,
  TomanIcon,
  TrendIcon,
  WishlistHeartIcon,
} from "@/components/layout/icons";
import { NAV_ICON_CLASS } from "@/components/layout/navMenuShared";

/** Same icon collection / sizing as the main navbar. */
export function ProfileNavIcon({
  id,
  className = NAV_ICON_CLASS,
}: {
  id: string;
  className?: string;
}) {
  switch (id) {
    case "dashboard":
      return <HomeOutlineIcon className={className} />;
    case "personal":
      return <LoginUserIcon className={className} />;
    case "addresses":
      return <LocationPinIcon className={className} />;
    case "orders":
      return <InvoiceDocIcon className={className} />;
    case "wishlist":
      return <WishlistHeartIcon className={className} />;
    case "reviews":
      return <CommunityIcon className={className} />;
    case "notifications":
      return <NotificationIcon className={className} />;
    case "history":
      return <TrendIcon className={className} />;
    case "wallet":
      return <TomanIcon className={className} />;
    case "gift-cards":
      return <GiftIcon className={className} />;
    default:
      return null;
  }
}
