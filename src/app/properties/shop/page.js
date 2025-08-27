import BannerWithBreadcrumb from "@/components/BannerWithBreadcrumb/BannerWithBreadcrumb";
import PropertySection from "@/components/PropertySection/PropertySection";
import bannerBreadcrumb from "@/data/bannerBreadcrumb";
import shop from "@/data/property/shop";

const ShopPage = () => {
  const { title, bannerImage, breadcrumbs } = bannerBreadcrumb.shop;

  return (
    <>
      <BannerWithBreadcrumb
        title={title}
        bannerImage={bannerImage}
        breadcrumbs={breadcrumbs}
      />
      <PropertySection category="shop" title="Shop Projects" data={shop} />
    </>
  );
}

export default ShopPage;