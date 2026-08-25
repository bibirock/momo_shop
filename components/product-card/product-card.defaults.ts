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

export function editorValuesFromConfig(config: ProductCardConfig): ProductCardEditorValues {
  return {
    imageId: config.content.imageId,
    imageAlt: config.content.imageAlt,
    promotion: config.content.promotion,
    title: config.content.title,
    salesText: config.content.salesText,
    price: String(config.content.price),
    originalPrice: config.content.originalPrice === undefined ? "" : String(config.content.originalPrice),
    reviewCount: String(config.content.reviewCount),
    badges: [...config.content.badges],
    accentColor: config.appearance.accentColor,
    borderRadius: String(config.appearance.borderRadius),
  };
}

export const DEFAULT_EDITOR_VALUES = editorValuesFromConfig(DEFAULT_PRODUCT_CARD);
