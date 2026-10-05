import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("b2b");

export default function B2bPage() {
  return renderStaticPage("b2b");
}
