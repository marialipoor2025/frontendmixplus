import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("enquiry");

export default function EnquiryPage() {
  return renderStaticPage("enquiry");
}
