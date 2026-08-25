"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductCardConfig } from "@/components/product-card/product-card.types";

type ProductCardProps = { config: ProductCardConfig };

const numberFormatter = new Intl.NumberFormat("en-US");

export function ProductCard({ config }: ProductCardProps) {
  const { content, appearance } = config;
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const imageFailed = failedImageSrc === content.imageSrc;

  return (
    <article
      className="product-card"
      data-testid="product-card"
      style={{
        "--card-accent": appearance.accentColor,
        borderRadius: `${appearance.borderRadius}px`,
      } as React.CSSProperties}
    >
      <div className="product-card__image-frame">
        {imageFailed ? (
          <div className="product-card__image-fallback" role="img" aria-label={content.imageAlt || "商品圖片"}>
            <span>IMAGE UNAVAILABLE</span>
            <strong>{content.imageAlt || "商品圖片"}</strong>
          </div>
        ) : (
          <Image
            alt={content.imageAlt || "商品圖片"}
            className="product-card__image"
            fill
            onError={() => setFailedImageSrc(content.imageSrc)}
            priority
            sizes="(max-width: 640px) 88vw, 360px"
            src={content.imageSrc}
          />
        )}
      </div>

      <div className="product-card__body">
        {content.promotion ? <p className="product-card__promotion">{content.promotion}</p> : null}
        <h2 className="product-card__title">{content.title || "未命名商品"}</h2>
        <div className="product-card__price-row">
          <span className="product-card__price">${numberFormatter.format(content.price)}</span>
          {content.originalPrice !== undefined ? (
            <span className="product-card__original-price">${numberFormatter.format(content.originalPrice)}</span>
          ) : null}
        </div>
        <div className="product-card__rating-row">
          <span aria-label="五星評價" className="product-card__stars">★★★★★</span>
          <span>{numberFormatter.format(content.reviewCount)}</span>
        </div>
        <p className="product-card__sales">{content.salesText}</p>
        {content.badges.length > 0 ? (
          <div aria-label="商品標籤" className="product-card__badges">
            {content.badges.map((badge) => <span className="product-card__badge" key={badge}>{badge}</span>)}
          </div>
        ) : null}
      </div>
    </article>
  );
}
