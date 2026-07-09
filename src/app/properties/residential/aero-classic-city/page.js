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
import aeroClassicCity from "@/data/propertyDetails/residential/aero-classic-city";
import LayoutSection from "@/components/LayoutSection/LayoutSection";

const AeroClassicCityPropertyPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.residential.aeroClassicCity;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <HeroSection data={aeroClassicCity} />
      <ScrollNav />
      <DescriptionSection description={aeroClassicCity.description} />
      <PaymentPlanSection paymentPlan={aeroClassicCity.paymentPlan} planUrl={aeroClassicCity.planUrl} />
      <LayoutSection data={aeroClassicCity.layoutSection} />
      <BrochureSection data={aeroClassicCity} previewImage={aeroClassicCity.previewImage} />
      <AmenitiesSection amenities={aeroClassicCity.amenities} />
      <ImageGallerySection gallery={aeroClassicCity.gallery} />
      <VideoTourSection videoUrl={aeroClassicCity.videoUrl} />
      <GoogleMapSection mapEmbedUrl={aeroClassicCity.mapEmbedUrl} />
      <AboutDeveloperSection developer={aeroClassicCity.developer} />
      <ClientReviewsSection reviews={aeroClassicCity.reviews} />
      <QASection questions={aeroClassicCity.questions} />
      <ContactCTASection />
    </>
  );
}

export default AeroClassicCityPropertyPage;
