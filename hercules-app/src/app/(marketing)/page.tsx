import { Hero } from "@/components/marketing/hero";
import { CaseStudyRail } from "@/components/marketing/case-study-rail";
import { BuildShowcase } from "@/components/marketing/build-showcase";
import { BuiltInFeatures } from "@/components/marketing/built-in-features";
import { ProductPanels } from "@/components/marketing/product-panels";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <CaseStudyRail />
      <BuildShowcase />
      <BuiltInFeatures />
      <ProductPanels />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
