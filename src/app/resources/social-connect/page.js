import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import ConnectWithUsSection from "@/components/ConnectWithUsSection/ConnectWithUsSection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";

const SocialConnectPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.socialConnect;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <ConnectWithUsSection />
    </>
  );
}

export default SocialConnectPage;