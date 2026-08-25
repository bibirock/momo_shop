export function parseNonNegativeSafeInteger(value: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseOptionalNonNegativeSafeInteger(value: string) {
  return value === "" ? undefined : parseNonNegativeSafeInteger(value);
}

export function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function parseBorderRadius(value: string) {
  const parsed = parseNonNegativeSafeInteger(value);
  return parsed !== null && parsed <= 24 ? parsed : null;
}

import { PRODUCT_CARD_BADGES, type ProductCardBadge, type ProductCardConfig, type ProductImageId } from "@/components/product-card/product-card.types";
import { DEFAULT_PRODUCT_CARD, PRODUCT_IMAGE_OPTIONS } from "@/components/product-card/product-card.defaults";

const productImageIds = new Set<ProductImageId>(PRODUCT_IMAGE_OPTIONS.map((option) => option.id));
const productBadges = new Set<ProductCardBadge>(PRODUCT_CARD_BADGES);

export function normalizeProductCardConfig(value: unknown): ProductCardConfig {
  if (!isProductCardConfig(value)) {
    return DEFAULT_PRODUCT_CARD;
  }

  return {
    ...value,
    content: {
      ...value.content,
      badges: [...value.content.badges],
    },
  };
}

export function isProductCardConfig(value: unknown): value is ProductCardConfig {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProductCardConfig>;
  const content = candidate.content;
  const appearance = candidate.appearance;
  if (candidate.id !== "demo-food" || candidate.schemaVersion !== 1 || candidate.variant !== "search-grid") return false;
  if (!content || typeof content !== "object" || !appearance || typeof appearance !== "object") return false;
  const cardContent = content as ProductCardConfig["content"];
  const cardAppearance = appearance as ProductCardConfig["appearance"];
  return productImageIds.has(cardContent.imageId)
    && typeof cardContent.imageSrc === "string"
    && typeof cardContent.imageAlt === "string"
    && typeof cardContent.promotion === "string"
    && typeof cardContent.title === "string"
    && typeof cardContent.salesText === "string"
    && Number.isSafeInteger(cardContent.price)
    && (cardContent.originalPrice === undefined || Number.isSafeInteger(cardContent.originalPrice))
    && Number.isSafeInteger(cardContent.reviewCount)
    && Array.isArray(cardContent.badges)
    && cardContent.badges.every((badge) => typeof badge === "string" && productBadges.has(badge as ProductCardBadge))
    && typeof cardAppearance.accentColor === "string"
    && isHexColor(cardAppearance.accentColor)
    && Number.isSafeInteger(cardAppearance.borderRadius)
    && cardAppearance.borderRadius >= 0
    && cardAppearance.borderRadius <= 24;
}
