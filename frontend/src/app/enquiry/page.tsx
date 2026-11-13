import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("enquiry");

/** Request form / info page linked from proforma description. */
export default function EnquiryPage() {
  return renderStaticPage("enquiry");
}
