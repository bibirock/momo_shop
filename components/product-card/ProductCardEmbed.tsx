"use client";

import { DEFAULT_PRODUCT_CARD } from "@/components/product-card/product-card.defaults";
import { ProductCard } from "@/components/product-card/ProductCard";
import { useProductCardStore } from "@/components/product-card/product-card-store";

export function ProductCardEmbed() {
  const savedConfig = useProductCardStore((state) => state.savedConfig);

  return (
    <main className="embed-shell" aria-label="商品卡嵌入內容">
      <div className="embed-card-frame">
        <ProductCard config={savedConfig ?? DEFAULT_PRODUCT_CARD} />
      </div>
    </main>
  );
}
