import goaImg from "@/images/projects/goa.jpg";

const projectsData = {
  residential: [
    {
      name: "Green Vista Residential Township - Dholera",
      image: "/images/all-properties/residential/dholera-green-vista/1.jpeg",
      slug: "residential/dholera-sky-rise-residency",
      size: "6 Acres | 207 Plots | Min 97 Sq. Yards",
      location:
        "Bilkul Dholera SIR ke Boundaries par (TP-2 & TP-3)",
      price: "₹8,999 per square yards | Limited Time Pre-Launch Offer",
      status: ["Exclusive", "Available", "New Launch"],
      badge: ["Premium Township,", " Smart-City Investment"],
    },
    
    {
      name: "Aero Classic City - Jewar International Airport, Yamuna Expressway",
      image: "/images/property/Aero Classic City.jpg",
      slug: "residential/aero-classic-city",
      size: "15 Acres | Min Area 100 Sq. Yards",
      location: "Yamuna Expressway, Near Jewar International Airport, Noida",
      price: "₹28 Lakh* | ₹28000 Per Sq. Yd onwards",
      status: ["Available", "New Launch"],
      badge: "Fully Gated Society",
    },
    {
      name: "Aero Star City - Jewar International Airport, Yamuna Expressway",
      image: "/images/property/projects/aero star city/WhatsApp Image 2026-07-10 at 12.54.48 PM.jpeg",
      slug: "residential/aero-star-city",
      size: "15 Acres | Min Area 100 Sq. Yards",
      location: "Yamuna Expressway, Near Jewar International Airport, Noida",
      price: "₹28 Lakh* | ₹28000 Per Sq. Yd onwards",
      status: ["Available", "New Launch"],
      badge: "Fully Gated Society",
    },

    
    // {
    //   name: "Shree Radha Sky Gardens",
    //   image: "/images/all-properties/residential/sky-garden/1.jpeg",
    //   slug: "residential/sky-gardens",
    //   size: "16 Acres | 19 Towers | 1960 Flats",
    //   location:
    //     "Sector 16B, Greater Noida West, Near Gaur City Mall & Gaur City Centre",
    //   price: "₹43.68 Lakh to ₹2.04 Cr* | ₹7800 Per Sq. Ft onwards",
    //   status: ["Ready to Move", "Available", "New Launch"],
    //   badge: ["Premium Township",],
    // },
  ],

  officeSpace: [
    {
      name: "Bhutani Alphathum - Office Space",
      image: "/images/property/Bhutani city center.jpg",
      slug: "office-space/bhutani-alphathum-office",
      size: "Office Spaces | Custom Sizes",
      location: "Sector 90, Noida",
      price: "₹14,990/sqft (Base Rate) | ₹24,000 - ₹35,000/sqft (Retail Shops)",
      status: ["Available", "Ready to Move"],
      badge: "Office Space",
    },
    {
      name: "Bhutani Cyberthum - Office Space",
      image: "/images/property/Cyberthum.jpg",
      slug: "office-space/bhutani-cyberthum-office",
      size: "200 - 750 sq ft | Lockable & Non-Lockable",
      location: "Sector 140A, Noida",
      price: "₹6,000 - ₹8,250/sqft | From ₹12L onwards",
      status: ["Available", "Under Construction", "Ready to Move"],
      badge: "Office Space",
    },
  ],
  commercial: [
    {
      name: "Bhutani Alphathum - Co Working Space",
      image: "/images/property/Alphathum.jpg",
      slug: "coworking-space/bhutani-alphathum",
      size: "Co-Working Spaces | 100 - 150 sq ft",
      location: "Sector 90, Noida",
      price: "₹12L - ₹14L (Sale) | ₹36,000/mo (Rent)",
      status: ["Available", "New Launch"],
      badge: "Co-Working Space",
    },
    {
      name: "Bhutani Cyberthum - Office Space",
      image: "/images/property/Cyberthum.jpg",
      slug: "office-space/bhutani-cyberthum-office",
      size: "200 - 750 sq ft | Lockable & Non-Lockable",
      location: "Sector 140A, Noida",
      price: "₹6,000 - ₹8,250/sqft | From ₹12L onwards",
      status: ["Available", "Under Construction", "Ready to Move"],
      badge: "Office Space",
    },
    {
      name: "Bhutani Cyberthum - Co Working MyPods",
      image: "/images/property/mall of noida.jpg",
      slug: "coworking-space/bhutani-cyberthum-mypods",
      size: "100 - 500 sq ft | Co-working Pods",
      location: "Sector 140A, Noida",
      price: "₹6.26L - ₹7.25L per pod",
      status: ["Available", "Under Construction"],
      badge: "Co-working Space",
    },
    {
      name: "Bhutani Alphathum - Office Space",
      image: "/images/property/Bhutani city center.jpg",
      slug: "office-space/bhutani-alphathum-office",
      size: "Office Spaces | Custom Sizes",
      location: "Sector 90, Noida",
      price: "₹14,990/sqft (Base Rate) | ₹24,000 - ₹35,000/sqft (Retail Shops)",
      status: ["Available", "Ready to Move"],
      badge: "Office Space",
    },
  ],
  farmhouse: [
    {
      name: "One Global Goa",
      image: goaImg,
      slug: "one-global-goa",
      size: "30 Acres",
      location: "Bicholim, Goa",
      status: ["Available"],
      price: "₹ 84.99 to 1.02 Cr*",
    },
  ],
  coworking: [
    {
      name: "Bhutani Alphathum - Co Working Space",
      image: "/images/property/Alphathum.jpg",
      slug: "coworking-space/bhutani-alphathum",
      size: "Co-Working Spaces | 100 - 150 sq ft",
      location: "Sector 90, Noida",
      price: "₹12L - ₹14L (Sale) | ₹36,000/mo (Rent)",
      status: ["Available", "New Launch"],
      badge: "Co-Working Space",
    },
    {
      name: "Bhutani Cyberthum - Co Working MyPods",
      image: "/images/property/mall of noida.jpg",
      slug: "coworking-space/bhutani-cyberthum-mypods",
      size: "100 - 500 sq ft | Co-working Pods",
      location: "Sector 140A, Noida",
      price: "₹6.26L - ₹7.25L per pod",
      status: ["Available", "Under Construction"],
      badge: "Co-working Space",
    },
  ],
};

export default projectsData;
