import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import CareersIntroSection from "@/components/CareersIntroSection/CareersIntroSection";
import JobOpeningsSection from "@/components/JobOpeningsSection/JobOpeningsSection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";

const CareersPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.careers;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <CareersIntroSection />
      <JobOpeningsSection />
    </>
  );
}

export default CareersPage;