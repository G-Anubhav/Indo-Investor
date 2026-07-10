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
import LayoutSection from "@/components/LayoutSection/LayoutSection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import aeroStarCity from "@/data/propertyDetails/residential/aero-star-city";

const AeroStarCityPropertyPage = () => {
  const { title, bannerImage, breadcrumbs } =
    bannerBreadcrumb.residential.aeroStarCity;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <HeroSection data={aeroStarCity} />
      <ScrollNav />
      <DescriptionSection description={aeroStarCity.description} />
      <PaymentPlanSection
        paymentPlan={aeroStarCity.paymentPlan}
        planUrl={aeroStarCity.planUrl}
      />
      <LayoutSection data={aeroStarCity.layoutSection} />
      <BrochureSection data={aeroStarCity} previewImage={aeroStarCity.previewImage} />
      <AmenitiesSection amenities={aeroStarCity.amenities} />
      <ImageGallerySection gallery={aeroStarCity.gallery} />
      <VideoTourSection videoUrl={aeroStarCity.videoUrl} />
      <GoogleMapSection mapEmbedUrl={aeroStarCity.mapEmbedUrl} />
      <AboutDeveloperSection developer={aeroStarCity.developer} />
      <ClientReviewsSection reviews={aeroStarCity.reviews} />
      <QASection questions={aeroStarCity.questions} />
      <ContactCTASection />
    </>
  );
};

export default AeroStarCityPropertyPage;
