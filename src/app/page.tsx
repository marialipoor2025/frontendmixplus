import { HomePage } from "@/components/home/HomePage";
import { getHomePageData } from "@/lib/api/home";

export default async function Page() {
  const data = await getHomePageData();
  return <HomePage data={data} />;
}
