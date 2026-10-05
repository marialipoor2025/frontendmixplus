import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("incredible-offers");

export default function IncredibleOffersPage() {
  return renderStaticPage("incredible-offers");
}
