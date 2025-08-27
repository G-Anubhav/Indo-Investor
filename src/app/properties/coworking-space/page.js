import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import coworkingSpaceProperties from "@/data/property/coworking-space";

const CoworkingSpacePage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.coworking;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="coworking-space" title="Co-Working Spaces" data={coworkingSpaceProperties} />
    </>
  );
}

export default CoworkingSpacePage;