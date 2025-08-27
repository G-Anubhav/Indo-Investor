import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import flats from "@/data/property/flat";

const FlatPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.flat;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="flat" title="Flats" data={flats} />
    </>
  );
}

export default FlatPage;