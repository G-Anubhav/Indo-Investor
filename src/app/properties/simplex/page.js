import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import simplex from "@/data/property/simplex";

const SimplexPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.simplex;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="simplex" title="Simplex Projects" data={simplex} />
    </>
  );
}

export default SimplexPage;