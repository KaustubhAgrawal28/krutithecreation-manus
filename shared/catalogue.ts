export type ProductCategory = "wall-art" | "plant-life" | "little-things";

export type CatalogueProduct = {
  id: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  price: number;
  description: string;
  details: string;
  image: string;
  badge?: string;
  featured?: boolean;
};

export const catalogue: CatalogueProduct[] = [
  {
    id: "sunbeam-wall-hanging",
    name: "Sunbeam Wall Hanging",
    shortName: "Sunbeam",
    category: "wall-art",
    price: 1890,
    description: "A soft, sculptural statement piece for quiet corners.",
    details: "Hand-knotted in natural cotton with a warm beechwood dowel. Approx. 52 × 74 cm.",
    image: "/manus-storage/knot-and-nest-wall-hanging_d8e85dcf.jpg",
    badge: "Studio favourite",
    featured: true,
  },
  {
    id: "hanging-garden",
    name: "Hanging Garden",
    shortName: "Hanging Garden",
    category: "plant-life",
    price: 980,
    description: "Let your favourite trailing plant take the spotlight.",
    details: "Sized for a 6–8 inch pot. Plant pot not included. Natural cotton rope and beech ring.",
    image: "/manus-storage/knot-and-nest-plant-hanger_5572b625.jpg",
    badge: "Low stock",
    featured: true,
  },
  {
    id: "terra-keychain",
    name: "Terra Keychain",
    shortName: "Terra",
    category: "little-things",
    price: 320,
    description: "A small daily detail, finished with a pop of terracotta.",
    details: "Braided cotton cord with brass ring. Approx. 12 cm including tassel.",
    image: "/manus-storage/knot-and-nest-keychain_ada1e2ac.jpg",
    badge: "Gift-ready",
    featured: true,
  },
  {
    id: "rainbow-keepsake",
    name: "Rainbow Keepsake",
    shortName: "Rainbow",
    category: "little-things",
    price: 560,
    description: "A cheerful little arch for nurseries, shelves and sunny days.",
    details: "Hand-wrapped cotton cord in sage, butter, blush and oat. Approx. 18 × 15 cm.",
    image: "/manus-storage/knot-and-nest-rainbow_2baf4ad7.jpg",
    badge: "New",
    featured: true,
  },
];

export const categoryLabels: Record<ProductCategory | "all", string> = {
  all: "All pieces",
  "wall-art": "Wall art",
  "plant-life": "Plant life",
  "little-things": "Little things",
};

export const findProduct = (id: string) => catalogue.find((product) => product.id === id);

export const formatPrice = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
