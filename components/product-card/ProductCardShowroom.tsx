"use client";

import { useState } from "react";

import { ProductCard } from "@/components/product-card/ProductCard";
import { ProductCardEditor } from "@/components/product-card/ProductCardEditor";
import { DEFAULT_PRODUCT_CARD, editorValuesFromConfig, PRODUCT_IMAGE_OPTIONS } from "@/components/product-card/product-card.defaults";
import { useProductCardStore } from "@/components/product-card/product-card-store";
import type { ProductCardBadge, ProductCardConfig, ProductCardEditorValues, ProductImageId } from "@/components/product-card/product-card.types";
import { isHexColor, parseBorderRadius, parseNonNegativeSafeInteger, parseOptionalNonNegativeSafeInteger } from "@/components/product-card/product-card.validation";

export function ProductCardShowroom() {
  const savedConfig = useProductCardStore((state) => state.savedConfig);
  const hasHydrated = useProductCardStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <section aria-label="商品卡工作區" className="showroom-loading">載入已保存的商品卡設定…</section>;
  }

  return <ProductCardShowroomContent initialConfig={savedConfig ?? DEFAULT_PRODUCT_CARD} />;
}

function ProductCardShowroomContent({ initialConfig }: { initialConfig: ProductCardConfig }) {
  const [values, setValues] = useState(() => editorValuesFromConfig(initialConfig));
  const [preview, setPreview] = useState(initialConfig);
  const [savedMessage, setSavedMessage] = useState("");
  const saveConfig = useProductCardStore((state) => state.saveConfig);

  function updateValues(field: keyof ProductCardEditorValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setPreview((current) => applyValidPreviewUpdate(current, field, value));
  }

  function updateBadge(badge: ProductCardBadge, checked: boolean) {
    const badges = checked ? [...values.badges, badge] : values.badges.filter((item) => item !== badge);
    setValues((current) => ({ ...current, badges }));
    setPreview((current) => ({ ...current, content: { ...current.content, badges } }));
  }

  return (
    <section aria-label="商品卡工作區" className="showroom-grid">
      <div className="showroom-panel showroom-preview" data-testid="preview-panel">
        <PanelHeading eyebrow="Live preview" label="search-grid" />
        <ProductCard config={preview} />
      </div>
      <div className="showroom-panel showroom-editor" data-testid="editor-panel">
        <PanelHeading eyebrow="Card controls" label="demo-food" />
        <ProductCardEditor values={values} onFieldChange={updateValues} onBadgeChange={updateBadge} />
        <div className="showroom-save-row">
          <button type="button" onClick={() => { saveConfig(preview); setSavedMessage("已儲存商品卡設定"); }}>儲存商品卡</button>
          {savedMessage ? <span role="status">{savedMessage}</span> : null}
        </div>
      </div>
    </section>
  );
}

function PanelHeading({ eyebrow, label }: { eyebrow: string; label: string }) {
  return <div className="showroom-panel__heading"><p>{eyebrow}</p><span>{label}</span></div>;
}

function applyValidPreviewUpdate(config: ProductCardConfig, field: keyof ProductCardEditorValues, value: string): ProductCardConfig {
  if (field === "imageId") {
    const image = PRODUCT_IMAGE_OPTIONS.find((option) => option.id === value);
    return image ? { ...config, content: { ...config.content, imageId: value as ProductImageId, imageSrc: image.src } } : config;
  }
  if (field === "price" || field === "reviewCount") {
    const parsed = parseNonNegativeSafeInteger(value);
    return parsed === null ? config : { ...config, content: { ...config.content, [field]: parsed } };
  }
  if (field === "originalPrice") {
    const parsed = parseOptionalNonNegativeSafeInteger(value);
    return parsed === null ? config : { ...config, content: { ...config.content, originalPrice: parsed } };
  }
  if (field === "accentColor") {
    return isHexColor(value) ? { ...config, appearance: { ...config.appearance, accentColor: value } } : config;
  }
  if (field === "borderRadius") {
    const parsed = parseBorderRadius(value);
    return parsed === null ? config : { ...config, appearance: { ...config.appearance, borderRadius: parsed } };
  }
  if (field === "badges") return config;
  return { ...config, content: { ...config.content, [field]: value } };
}
