import { HomePage } from "@/components/home/HomePage";
import { getHomePageData } from "@/lib/api/home";
import { getMainNavData } from "@/lib/api/nav";

export default async function Page() {
  const [data, nav] = await Promise.all([
    getHomePageData(),
    getMainNavData(),
  ]);
  return <HomePage data={data} nav={nav} />;
}
