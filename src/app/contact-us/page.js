import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import ConnectWithUsSection from "@/components/ConnectWithUsSection/ConnectWithUsSection";
import ContactSection from "@/components/ContactSection/ContactSection";
import MapSection from "@/components/MapSection/MapSection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";

const ContactUsPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.contactUs;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <ContactSection />
      <MapSection />
      <ConnectWithUsSection />
    </>
  );
}

export default ContactUsPage;