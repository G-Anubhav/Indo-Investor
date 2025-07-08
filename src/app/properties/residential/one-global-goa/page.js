import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import AboutDeveloperSection from "@/components/PropertyDetail/AboutDeveloperSection/AboutDeveloperSection";
import AmenitiesSection from "@/components/PropertyDetail/AmenitiesSection/AmenitiesSection";
import BrochureSection from "@/components/PropertyDetail/BrochureSection/BrochureSection";
import ClientReviewsSection from "@/components/PropertyDetail/ClientReviewsSection/ClientReviewsSection";
import ContactCTASection from "@/components/PropertyDetail/ContactCTASection/ContactCTASection";
import DescriptionSection from "@/components/PropertyDetail/DescriptionSection/DescriptionSection";
import GoogleMapSection from "@/components/PropertyDetail/GoogleMapSection/GoogleMapSection";
import HeroSection from "@/components/PropertyDetail/HeroSection/HeroSection";
import ImageGallerySection from "@/components/PropertyDetail/ImageGallerySection/ImageGallerySection";
import PaymentPlanSection from "@/components/PropertyDetail/PaymentPlanSection/PaymentPlanSection";
import QASection from "@/components/PropertyDetail/QASection/QASection";
import ScrollNav from "@/components/PropertyDetail/ScrollNav/ScrollNav";
import VideoTourSection from "@/components/PropertyDetail/VideoTourSection/VideoTourSection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import oneGlobalGoa from "@/data/propertyDetails/residential/one-global-goa"

const SocialConnectPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.residential.oneGlobalGoa;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <HeroSection data={oneGlobalGoa} />
      <ScrollNav />
      <DescriptionSection description={oneGlobalGoa.description} />
      <PaymentPlanSection paymentPlan={oneGlobalGoa.paymentPlan} planUrl={oneGlobalGoa.planUrl} />
      <BrochureSection data={oneGlobalGoa} />
      <AmenitiesSection amenities={oneGlobalGoa.amenities} />
      <ImageGallerySection gallery={oneGlobalGoa.gallery} />
      <VideoTourSection videoUrl={oneGlobalGoa.videoUrl} />
      <GoogleMapSection mapEmbedUrl={oneGlobalGoa.mapEmbedUrl} />
      <AboutDeveloperSection developer={oneGlobalGoa.developer} />
      <ClientReviewsSection reviews={oneGlobalGoa.reviews} />
      <QASection questions={oneGlobalGoa.questions} />
      <ContactCTASection />
    </>
  );
}

export default SocialConnectPage;