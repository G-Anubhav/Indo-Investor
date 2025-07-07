import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import residentialProperties from "@/data/property/residential";

const ResidentialPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.residential;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="residential" title="Residential Projects" data={residentialProperties} />
    </>
  );
}

export default ResidentialPage;