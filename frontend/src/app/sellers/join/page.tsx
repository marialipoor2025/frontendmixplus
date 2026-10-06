import { redirect } from "next/navigation";

/** Legacy "become seller" URL → seller portal login. */
export default function SellersJoinPage() {
  redirect("/seller/login");
}
