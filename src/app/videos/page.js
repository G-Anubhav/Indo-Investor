import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import VideoGallery from "@/components/VideoGallery/VideoGallery";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";

const VideosPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.videos;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <VideoGallery />
    </>
  );
}

export default VideosPage;