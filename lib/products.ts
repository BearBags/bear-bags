export interface ProductProfile {
  id: number;
  slug: string;
  title: string;
  price: number;
  description: string;
  bagSize: string;
  bagCount: number;
  imageSrc: string;
  imageAlt: string;
  highlight: string;
  summary: string;
  details: string[];
  icon: string;
  rating?: number;
  freeDelivery?: string;
  inStock?: string;
  perBag: string;
  orders: string;
}

export const products: ProductProfile[] = [
  {
    id: 2,
    slug: 'medium-size-bag',
    title: 'Bear Bags — Medium',
    price: 259,
    description: '30 compostable garbage bags',
    bagSize: '19 x 21 inches',
    bagCount: 30,
    imageSrc: '/images/Box_Roll_Edited_White.png',
    imageAlt: 'Bear Bags — Medium',
    highlight: 'Strong. Compostable.',
    summary:
      'Compact, convenient, and easy to use! Our bags with handles tear smoothly from the roll and open extra wide for mess-free handling.',
    details: [
      'Extra-strong compostable garbage bags engineered for strength without conventional plastic.',
      'CPCB Certified | TÜV Austria – OK Compost Industrial',
      'Designed for wet and dry household waste'
    ],
    icon: '/images/Box_Roll_Edited_White.png',
    rating: 4.5,
    freeDelivery: 'Free delivery on all orders',
    inStock: 'In stock . Ships within 1 business day',
    perBag: '₹9.3 per bag',
    orders: " 230+ orders"
  },
];

export const getProductBySlug = (slug: string): ProductProfile | undefined => {
  return products.find((product) => product.slug === slug);
};

export const getProductById = (id: number): ProductProfile | undefined => {
  return products.find((product) => product.id === id);
};
