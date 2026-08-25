export const PRODUCT_CARD_BADGES = ["速", "折價券", "登記", "贈品"] as const;

export type ProductCardBadge = (typeof PRODUCT_CARD_BADGES)[number];
export type ProductImageId = "food" | "health" | "fashion";

export type ProductImageOption = {
  id: ProductImageId;
  label: string;
  src: string;
};

export type ProductCardConfig = {
  id: "demo-food";
  schemaVersion: 1;
  variant: "search-grid";
  content: {
    imageId: ProductImageId;
    imageSrc: string;
    imageAlt: string;
    promotion: string;
    title: string;
    salesText: string;
    price: number;
    originalPrice?: number;
    reviewCount: number;
    badges: ProductCardBadge[];
  };
  appearance: {
    accentColor: string;
    borderRadius: number;
  };
};

export type ProductCardEditorValues = {
  imageId: ProductImageId;
  imageAlt: string;
  promotion: string;
  title: string;
  salesText: string;
  price: string;
  originalPrice: string;
  reviewCount: string;
  badges: ProductCardBadge[];
  accentColor: string;
  borderRadius: string;
};
