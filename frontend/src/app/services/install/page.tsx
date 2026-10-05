import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("services/install");

export default function InstallServicePage() {
  return renderStaticPage("services/install");
}
