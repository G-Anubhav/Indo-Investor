const oneGlobalGoa = {
  id: 1,
  name: "One Global Goa",
  location: "Bicholim, Goa, Goa",
  price: "84.99 to 1.02 Cr*",
  perUnit: "₹ 5522 Per Sq. Yd Onwards",
  rating: 4.0,
  reviewCount: 7,
  status: "New Launch",
  size: "30 Acres",
  configurations: ["3-BHK ", "4-BHK"],
  forSale: true,
  planUrl: "/pdfs/payment-plan.pdf",
  brochureUrl: "one-global-goa/brochure/sample.pdf",
  images: [
    "/images/all-properties/residential/one-global-goa-1.jpg",
    "/images/all-properties/residential/one-global-goa-1.jpg",
    "/images/all-properties/residential/one-global-goa-1.jpg",
  ],
  description: "One Global Goa is a premium residential project that offers modern living spaces surrounded by the serene beauty of Goa. Designed for comfort and luxury, the property features well-planned amenities, contemporary architecture, and easy access to key destinations, making it an ideal choice for both investment and personal living.",
  paymentPlan: [
    { milestone: "At Booking", amount: "₹1,00,000" },
    { milestone: "Within 30 Days", amount: "10% of Total Amount" },
    { milestone: "On Plinth", amount: "15%" },
    { milestone: "On Slab Completion", amount: "25%" },
    { milestone: "On Possession", amount: "Balance Amount" }
  ],
  amenities: [
    { label: "Swimming Pool", icon: "/images/icons/pool.svg" },
    { label: "Club House", icon: "/images/icons/clubhouse.svg" },
    { label: "24x7 Security", icon: "/images/icons/security.svg" },
    { label: "Power Backup", icon: "/images/icons/power.png" },
    { label: "Gymnasium", icon: "/images/icons/gym.svg" },
  ],
  gallery: [
    '/images/all-properties/residential/goa-1.webp',
    '/images/all-properties/residential/goa-2.webp',
    '/images/all-properties/residential/goa-3.webp',
    '/images/all-properties/residential/goa-4.webp',
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14009.701237962152!2d77.355155932727!3d28.617012587389283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce55e6c23b983%3A0x742cc2661a6d7a87!2sSector%2062%20Noida!5e0!3m2!1sen!2sin!4v1751952311255!5m2!1sen!2sin",
  developer: {
    name: 'ABC Group',
    description: 'ABC Group is one of India’s leading real estate developers, known for innovation, integrity, and timely delivery. With a legacy of excellence across 2 decades, ABC has shaped skylines with residential, commercial, and luxury projects.',
    image: '/images/developers/lodha.png',
  },
  reviews: [
    {
      name: 'Ravi Sharma',
      rating: 5,
      review: 'Excellent project and support. Highly recommended!',
      image: '/images/clients/ravi.jpg',
    },
    {
      name: 'Meena Kapoor',
      rating: 4,
      review: 'The team was professional and everything was on time.',
    },
    {
      name: 'Aman Gupta',
      rating: 5,
      review: 'Loved the amenities and construction quality!',
      image: '/images/clients/aman.jpg',
    },
  ],
  questions: [
    {
      question: 'What is the possession date of the property?',
      answer: 'The expected possession date is December 2025.',
    },
    {
      question: 'Is home loan available from major banks?',
      answer: 'Yes, home loans are available from HDFC, ICICI, SBI, and others.',
    },
    {
      question: 'Are there any maintenance charges?',
      answer: 'Yes, monthly maintenance charges are applicable as per RWA policy.',
    },
  ],
};

export default oneGlobalGoa;
