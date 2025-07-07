import HeroBanner from "@/components/HeroBanner/HeroBanner";
import TopBuilders from "@/components/TopBuilders/TopBuilders";
import ProjectsSection from "@/components/ProjectsSection/ProjectsSection";
import AboutSection from "@/components/AboutSection/AboutSection";
import CounterSection from "@/components/CounterSection/CounterSection";
import AmenitiesSection from "@/components/AmenitiesSection/AmenitiesSection";
import CTASection from "@/components/CTASection/CTASection";
import WelcomeSection from "@/components/WelcomeSection/WelcomeSection";
import OurMissionSection from "@/components/OurMissionSection/OurMissionSection";
import TestimonialSection from "@/components/TestimonialSection/TestimonialSection";
import LatestNewsSection from "@/components/LatestNewsSection/LatestNewsSection";
import TeamSection from "@/components/TeamSection/TeamSection";
import OurValuesSection from "@/components/OurValuesSection/OurValuesSection";
import AllProperties from "@/components/AllProperties/AllProperties";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <AboutSection />
      <AllProperties />
      <TopBuilders />
      <ProjectsSection />
      <OurMissionSection />
      <AmenitiesSection />
      <CounterSection />
      <OurValuesSection />
      <WelcomeSection />
      <TeamSection />
      <CTASection />
      <TestimonialSection />
      <LatestNewsSection />
    </>
  );
}
