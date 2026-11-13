import { redirect } from "next/navigation";

/** Legacy B2B path — organizational purchase now lives on /enquiry. */
export default function B2bPage() {
  redirect("/enquiry");
}
