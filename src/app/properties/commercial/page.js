import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import commercialProperties from "@/data/property/commercial";

const CommercialPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.commercial;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="commercial" title="Commercial Projects" data={commercialProperties} />
    </>
  );
}

export default CommercialPage;