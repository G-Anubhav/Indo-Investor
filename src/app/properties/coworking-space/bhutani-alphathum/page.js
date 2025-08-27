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
import bhutaniAlphathum from "@/data/propertyDetails/coworking-space/bhutani-alphathum"

const SocialConnectPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.coworking.bhutaniAlphathum;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <HeroSection data={bhutaniAlphathum} />
      <ScrollNav />
      <DescriptionSection description={bhutaniAlphathum.description} />
      <PaymentPlanSection paymentPlan={bhutaniAlphathum.paymentPlan} planUrl={bhutaniAlphathum.planUrl} />
      {/* <BrochureSection data={bhutaniAlphathum} /> */}
      <AmenitiesSection amenities={bhutaniAlphathum.amenities} />
      <ImageGallerySection gallery={bhutaniAlphathum.gallery} />
      <VideoTourSection videoUrl={bhutaniAlphathum.videoUrl} />
      <GoogleMapSection mapEmbedUrl={bhutaniAlphathum.mapEmbedUrl} />
      <AboutDeveloperSection developer={bhutaniAlphathum.developer} />
      <ClientReviewsSection reviews={bhutaniAlphathum.reviews} />
      <QASection questions={bhutaniAlphathum.questions} />
      <ContactCTASection />
    </>
  );
}

export default SocialConnectPage;