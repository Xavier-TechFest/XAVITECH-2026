import OriginalHomepage from "@/components/home/OriginalHomepage";
import PostponementLandingPage from "@/components/home/PostponementLandingPage";
import { POSTPONEMENT_MODE } from "@/lib/siteMode";

export default function Home() {
  return POSTPONEMENT_MODE ? <PostponementLandingPage /> : <OriginalHomepage />;
}
