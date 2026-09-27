export const company = {
  name: 'Guru Tex Spares',
  tagline: 'Manufacturer and Supplier of Spares and Accessories for Airjet Looms',
  phones: ['+91-9843040307', '+91-9865702505'],
  email: 'guruengg.madurai@gmail.com',
  address: [
    '47 A, Mannar Thirumalai Naicker Street',
    'Thanigai Nagar, Thiru Nagar',
    'Madurai, Tamil Nadu, India',
    'Pincode: 625006',
  ],
  socials: {
    instagram: 'https://www.instagram.com/gurutexspares/',
    facebook: 'https://www.facebook.com/gurutex.spares',
    linkedin: 'https://www.linkedin.com/company/guru-tex-spares-madurai-tamilnadu-india/?viewAsMember=true',
  },
};

const imageBase = `${process.env.PUBLIC_URL || ''}/guruspares-images`;

export const brandAssets = {
  logo: `${imageBase}/Logo.png`,
};

export const homeSlides = [
  `${imageBase}/home1.png`,
  `${imageBase}/home2.png`,
  `${imageBase}/home3.png`,
  `${imageBase}/home4.png`,
  `${imageBase}/home5.png`,
];

export const pageHeroImages = {
  company: `${imageBase}/Company_01.png`,
  divisions: `${imageBase}/Division_01.png`,
  products: `${imageBase}/Products_01.png`,
  responsibility: `${imageBase}/Responsibility_01.png`,
  blog: `${imageBase}/Blogs_01.png`,
  careers: `${imageBase}/Careers_01.png`,
  contact: `${imageBase}/Contact.png`,
};

export const productGroups = [
  'All Products Catalogue',
  'Toyota Rings & Toyota Spares',
  'Picanol Rings and Picanol Spares',
  'Tsudakoma Rings + Tsudakoma Spares',
  'Rifa, Baijia, Red Flag, C2H & China Loom Spares',
  'Air Cutter Spares',
  'Itema Loom Rings and Spares',
  'Sulzer Rings',
  'Ruti-C Spares',
  'Staubli Spares',
  'Other Spares (General Spares)',
];

export const strengths = [
  'Precision spares for shuttle and shuttle-less Airjet looms',
  'Custom solutions for temple mark issues and poppet valve choking',
  'Maintenance support for selected spares including selvedge rollers',
  'Products used across Toyota, Tsudakoma, Picanol, Dornier, Itema, Sulzer, Somet and Ruti-C loom lines',
];
