import AllProperties from "@/components/AllProperties/AllProperties";
import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import ConnectWithUsSection from "@/components/ConnectWithUsSection/ConnectWithUsSection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";

const PropertiesPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.properties;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <AllProperties />
      <ConnectWithUsSection />
    </>
  );
}

export default PropertiesPage;