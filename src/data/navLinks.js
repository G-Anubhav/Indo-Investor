const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Videos", href: "/videos" },
  {
    label: "Properties",
    dropdown: true,
    children: [
      { label: "Residential", href: "/properties/residential" },
      { label: "Commercial", href: "/properties/commercial" },
      { label: "Farm House", href: "/properties/farm-house" },
      { label: "Flat", href: "/properties/flat" },
      { label: "Simplex", href: "/properties/simplex" },
      { label: "Duplex", href: "/properties/duplex" },
      { label: "Villas", href: "/properties/villas" },
      { label: "Office Space", href: "/properties/office-space" },
      { label: "Shop", href: "/properties/shop" },
      { label: "Co-working Space", href: "/properties/co-working-space" },
    ],
  },
  {
    label: "Resources",
    dropdown: true,
    children: [
      { label: "News and Event", href: "/resources/news-events" },
      { label: "Social Connect", href: "/resources/social-connect" },
    ],
  },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact-us" },
];

export default navLinks;
