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
import shreeRadhaSkyGardens from "@/data/propertyDetails/residential/sky-gardens";

const SkyGardensPropertyPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.residential.skyGardens;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <HeroSection data={shreeRadhaSkyGardens} />
      <ScrollNav />
      <DescriptionSection description={shreeRadhaSkyGardens.description} />
      <PaymentPlanSection paymentPlan={shreeRadhaSkyGardens.paymentPlan} planUrl={shreeRadhaSkyGardens.planUrl} />
      <BrochureSection data={shreeRadhaSkyGardens} previewImage={shreeRadhaSkyGardens.previewImage} />
      <AmenitiesSection amenities={shreeRadhaSkyGardens.amenities} />
      <ImageGallerySection gallery={shreeRadhaSkyGardens.gallery} />
      <VideoTourSection videoUrl={shreeRadhaSkyGardens.videoUrl} />
      <GoogleMapSection mapEmbedUrl={shreeRadhaSkyGardens.mapEmbedUrl} />
      <AboutDeveloperSection developer={shreeRadhaSkyGardens.developer} />
      <ClientReviewsSection reviews={shreeRadhaSkyGardens.reviews} />
      <QASection questions={shreeRadhaSkyGardens.questions} />
      <ContactCTASection />
    </>
  );
}

export default SkyGardensPropertyPage;