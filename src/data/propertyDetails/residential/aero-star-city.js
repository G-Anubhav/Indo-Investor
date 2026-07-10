import aeroClassicCity from "./aero-classic-city";

const aeroStarImages = [
  "/images/property/projects/aero star city/WhatsApp Image 2026-07-10 at 12.54.48 PM.jpeg",
  "/images/property/projects/aero star city/2.jpeg",
  "/images/property/projects/aero star city/3.jpeg",
  "/images/property/projects/aero star city/4.jpeg",
  "/images/property/projects/aero star city/5.jpeg",
  "/images/property/projects/aero star city/6.jpeg",
];

const renameProject = (value) => {
  if (typeof value === "string") {
    return value.replaceAll("Aero Classic City", "Aero Star City");
  }

  if (Array.isArray(value)) {
    return value.map(renameProject);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, renameProject(item)])
    );
  }

  return value;
};

const aeroStarCity = {
  ...renameProject(aeroClassicCity),
  id: 5,
  name: "Aero Star City",
  image: aeroStarImages[0],
  slug: "residential/aero-star-city",
  previewImage: aeroStarImages[0],
  images: aeroStarImages,
  gallery: aeroStarImages,
  videoUrl:
    "/images/property/projects/aero star city/WhatsApp Video 2026-07-10 at 12.54.44 PM.mp4",
  layoutSection: {
    ...renameProject(aeroClassicCity.layoutSection),
    images: [
      {
        src: aeroStarImages[0],
        caption: "Aero Star City Project Overview",
      },
      {
        src: aeroStarImages[1],
        caption: "Township Planning & Plot Development",
      },
      {
        src: aeroStarImages[2],
        caption: "Internal Development View",
      },
    ],
    pdf: {
      url: "/contact-us",
      name: "Aero Star City Layout Details",
    },
  },
  developer: {
    ...renameProject(aeroClassicCity.developer),
    image: aeroStarImages[0],
  },
};

export default aeroStarCity;
