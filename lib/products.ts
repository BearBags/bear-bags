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
  subscriptionLabel: string;
  subscriptionDetails: string;
  oneTimeLabel: string;
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
    price: 279,
    description: '30 compostable garbage bags',
    bagSize: '19x21 inch',
    bagCount: 30,
    imageSrc: '/images/Box_Roll_Edited_White.png',
    imageAlt: 'Bear Bags — Medium',
    highlight: 'Strong. Compostable.',
    summary:
      'Compact, convenient, and easy to use! Our bags with handles tear smoothly from the roll and open extra wide for mess-free handling.',
    subscriptionLabel: 'Subscribe & Save',
    subscriptionDetails: '3 month subscription with 10% discount',
    oneTimeLabel: 'One-Time Purchase',
    details: [
      'Our handle bags open extra wide so they can handle any size mess. Easy-tie handles make picking up and carrying used bags a clean and smooth experience.',
      'Stash a roll in your pocket, front pouch, backpack, car, or stroller and never be caught without one.',
    ],
    icon: '/images/Box_Roll_Edited_White.png',
    rating: 4.5,
    freeDelivery: 'Free delivery on orders over ₹499',
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
