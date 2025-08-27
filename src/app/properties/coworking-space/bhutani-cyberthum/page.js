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
import bhutaniCyberthum from "@/data/propertyDetails/coworking-space/bhutani-cyberthum";

const CyberthumPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.coworking.bhutaniCyberthum;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <HeroSection data={bhutaniCyberthum} />
      <ScrollNav />
      <DescriptionSection description={bhutaniCyberthum.description} />
      <PaymentPlanSection paymentPlan={bhutaniCyberthum.paymentPlan} planUrl={bhutaniCyberthum.planUrl} />
      {/* <BrochureSection data={bhutaniCyberthum} /> */}
      <AmenitiesSection amenities={bhutaniCyberthum.amenities} />
      <ImageGallerySection gallery={bhutaniCyberthum.gallery} />
      <VideoTourSection videoUrl={bhutaniCyberthum.videoUrl} />
      <GoogleMapSection mapEmbedUrl={bhutaniCyberthum.mapEmbedUrl} />
      <AboutDeveloperSection developer={bhutaniCyberthum.developer} />
      <ClientReviewsSection reviews={bhutaniCyberthum.reviews} />
      <QASection questions={bhutaniCyberthum.questions} />
      <ContactCTASection />
    </>
  );
};

export default CyberthumPage;
