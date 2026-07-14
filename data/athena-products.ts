export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  size: string;
  price: string;
  image: string;
  hoverImage?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
};

export const featuredProducts: Product[] = [
  {
    id: "collagen-peptide",
    name: "Unflavoured Collagen Peptide",
    slug: "/products/unflavoured-collagen-peptide",
    description:
      "Pure hydrolyzed Type I & III collagen for effortless daily wellness.",
    size: "454 g",
    price: "$XX.XX",
    image: "/images/athena/products/collagen-product.jpg",
    hoverImage: "/images/athena/hero.jpg",
    rating: 5,
    reviewCount: 0,
    tags: ["10 G COLLAGEN", "TYPE I & III", "ZERO SUGAR", "GLUTEN FREE"],
  },
  {
    id: "cookies-cream-whey-protein",
    name: "Cookies & Cream Whey Protein",
    slug: "/products/cookies-cream-whey-protein",
    description:
      "Rich, creamy whey protein created for everyday fitness and recovery.",
    size: "900 g",
    price: "$XX.XX",
    image: "/images/athena/products/protein-product.jpg",
    hoverImage: "/images/athena/hero.jpg",
    rating: 5,
    reviewCount: 0,
    tags: ["30 G PROTEIN", "140 CALORIES", "3 G FIBRE", "ZERO ADDED SUGAR"],
  },
  {
    id: "iced-cappuccino-whey-protein",
    name: "Iced Cappuccino Flavoured Whey Protein",
    slug: "/products/iced-cappuccino-whey-protein",
    description:
      "Smooth iced cappuccino flavoured whey protein for everyday fitness and recovery.",
    size: "900 g",
    price: "$67.99",
    image: "/images/athena/products/iced-cap-product.jpg",
    hoverImage: "/images/athena/hero.jpg",
    rating: 5,
    reviewCount: 0,
    tags: ["30 G PROTEIN", "ICED CAPPUCCINO", "ZERO ADDED SUGAR", "GLUTEN FREE"],
  },
];
