import HeroSection from "./components/HeroSection";
import Impact from "./components/Impact";
import WhyBearBags from "./components/WhyBearBags";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import ProductIntroduction from "./components/ProductIntroduction";
import Newsletter from "./components/Newsletter";
import { getContributions } from "@/lib/contributions";

// Static page, rebuilt when the admin changes the price or a contribution
// (revalidatePath in app/api/admin/products and app/api/admin/contributions)
// and every 5 minutes as a safety net.
export const revalidate = 300;

export default async function Home() {
  const contributions = await getContributions();
  const contributedTotal = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Product Philosophy */}
      <WhyBearBags /> 

      {/* 3. Product Introduction  */}
      <ProductIntroduction />

      {/* 4. Impact */}
      <Impact contributedTotal={contributedTotal} />

      {/* 5. Testimonials */}
      <Testimonials />

      {/* 6. FAQ */}
      <FAQ />

      {/* 7. Newsletter Signup */}
      <Newsletter />
    </div>
  );
}