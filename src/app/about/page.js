import AboutSection from "@/components/AboutSection/AboutSection";
import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import OurMissionSection from "@/components/OurMissionSection/OurMissionSection";
import OurValuesSection from "@/components/OurValuesSection/OurValuesSection";
import TestimonialSection from "@/components/TestimonialSection/TestimonialSection";
import WhyChooseUs from "@/components/WhyChooseUs/WhyChooseUs";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";

const AboutPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.about;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <AboutSection />
      <OurMissionSection />
      <WhyChooseUs />
      <OurValuesSection />
      <TestimonialSection />
    </>
  );
};

export default AboutPage;
