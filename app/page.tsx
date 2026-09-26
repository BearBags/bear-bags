import HeroSection from "./components/HeroSection";
import Impact from "./components/Impact";
import WhyBearBags from "./components/WhyBearBags";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import OurStory from "./components/OurStory";
import ProductIntroduction from "./components/ProductIntroduction";
import Newsletter from "./components/Newsletter";

// Static page, rebuilt when the admin changes the price (revalidatePath in
// app/api/admin/products) and every 5 minutes as a safety net.
export const revalidate = 300;

export default function Home() {
  return (
    <div>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Product Philosophy */}
      <WhyBearBags /> 

      {/* 3. Product Introduction  */}
      <ProductIntroduction />

      {/* 4. Impact */}
      <Impact />

      {/* 5. Our Story  */}
      {/* <OurStory /> */}

      {/* 6. Testimonials */}
      <Testimonials />

      {/* 7. FAQ */}
      <FAQ />

      {/* 8. Newsletter Signup */}
      <Newsletter />
    </div>
  );
}