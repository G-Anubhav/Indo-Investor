import AmenitiesSection from "@/components/PropertyDetail/AmenitiesSection/AmenitiesSection";
import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import AboutDeveloperSection from "@/components/PropertyDetail/AboutDeveloperSection/AboutDeveloperSection";
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
import dholeraSkyRiseResidency from "@/data/propertyDetails/residential/dholera-sky-rise-residency";
import LayoutSection from "@/components/LayoutSection/LayoutSection";
import PropertyDocuments from "@/components/PropertyDocuments/PropertyDocuments";

const GreenVistaPropertyPage = () => {
    const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.residential.dholeraSkyRise;
    return (
        <>
          <BannerWithBreadcrumb
            title={title}
            bannerImage={bannerImage}
            breadcrumbs={breadcrumbs}
          />
          <HeroSection data={dholeraSkyRiseResidency} />
          <ScrollNav />
          <DescriptionSection description={dholeraSkyRiseResidency.description} />
          <PaymentPlanSection paymentPlan={dholeraSkyRiseResidency.paymentPlan} planUrl={dholeraSkyRiseResidency.planUrl} />
          <LayoutSection data={dholeraSkyRiseResidency.layoutSection} />
          <BrochureSection data={dholeraSkyRiseResidency} previewImage={dholeraSkyRiseResidency.previewImage} />
          <PropertyDocuments data={dholeraSkyRiseResidency.documentData} />
          <AmenitiesSection amenities={dholeraSkyRiseResidency.amenities} />
          <ImageGallerySection gallery={dholeraSkyRiseResidency.gallery} />
          <VideoTourSection videoUrl={dholeraSkyRiseResidency.videoUrl} />
          <GoogleMapSection mapEmbedUrl={dholeraSkyRiseResidency.mapEmbedUrl} />
          <AboutDeveloperSection developer={dholeraSkyRiseResidency.developer} />
          <ClientReviewsSection reviews={dholeraSkyRiseResidency.reviews} />
          <QASection questions={dholeraSkyRiseResidency.questions} />
          <ContactCTASection />
        </>
    )
}
export default GreenVistaPropertyPage;