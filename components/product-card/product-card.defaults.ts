import type {
  ProductCardConfig,
  ProductCardEditorValues,
  ProductImageOption,
} from "@/components/product-card/product-card.types";

export const PRODUCT_IMAGE_OPTIONS: ProductImageOption[] = [
  { id: "food", label: "食品", src: "/merchant-card-showroom/search-card-food.png" },
  { id: "health", label: "保健", src: "/merchant-card-showroom/search-card-health.png" },
  { id: "fashion", label: "服飾", src: "/merchant-card-showroom/search-card-fashion.png" },
];

export const DEFAULT_PRODUCT_CARD: ProductCardConfig = {
  id: "demo-food",
  schemaVersion: 1,
  variant: "search-grid",
  content: {
    imageId: "food",
    imageSrc: PRODUCT_IMAGE_OPTIONS[0].src,
    imageAlt: "日式咖哩調理包商品示意圖",
    promotion: "限時優惠",
    title: "【MOMO精選】日式咖哩調理包 18 入",
    salesText: "總銷量>1,000",
    price: 999,
    originalPrice: 1290,
    reviewCount: 5208,
    badges: ["速", "登記"],
  },
  appearance: { accentColor: "#D71F69", borderRadius: 12 },
};

export const DEFAULT_EDITOR_VALUES: ProductCardEditorValues = {
  imageId: DEFAULT_PRODUCT_CARD.content.imageId,
  imageAlt: DEFAULT_PRODUCT_CARD.content.imageAlt,
  promotion: DEFAULT_PRODUCT_CARD.content.promotion,
  title: DEFAULT_PRODUCT_CARD.content.title,
  salesText: DEFAULT_PRODUCT_CARD.content.salesText,
  price: String(DEFAULT_PRODUCT_CARD.content.price),
  originalPrice: String(DEFAULT_PRODUCT_CARD.content.originalPrice),
  reviewCount: String(DEFAULT_PRODUCT_CARD.content.reviewCount),
  badges: DEFAULT_PRODUCT_CARD.content.badges,
  accentColor: DEFAULT_PRODUCT_CARD.appearance.accentColor,
  borderRadius: String(DEFAULT_PRODUCT_CARD.appearance.borderRadius),
};
