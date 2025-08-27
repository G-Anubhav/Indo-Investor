import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import duplex from "@/data/property/duplex";

const DuplexPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.duplex;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="duplex" title="Duplex Projects" data={duplex} />
    </>
  );
}

export default DuplexPage;