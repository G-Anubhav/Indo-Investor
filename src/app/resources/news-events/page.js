import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import ConnectWithUsSection from "@/components/ConnectWithUsSection/ConnectWithUsSection";
import LatestNewsSection from "@/components/LatestNewsSection/LatestNewsSection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";

const NewsEventsPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.newsEvents;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <LatestNewsSection />
      <ConnectWithUsSection />
    </>
  );
}

export default NewsEventsPage;