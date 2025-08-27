import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import farmhouseProperties from "@/data/property/farmhouse";

const FarmhousePage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.farmhouse;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="farmhouse" title="Farm House Projects" data={farmhouseProperties} />
    </>
  );
}

export default FarmhousePage;