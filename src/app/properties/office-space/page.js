import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import officeSpaceProperties from "@/data/property/office-space";

const OfficeSpacePage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.office;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="office-space" title="Office Spaces" data={officeSpaceProperties  } />
    </>
  );
}

export default OfficeSpacePage;