import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import villas from "@/data/property/villas";

const VillasPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.villas;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="villas" title="Villas Projects" data={villas} />
    </>
  );
}

export default VillasPage;