import { ProductCardShowroom } from "@/components/product-card/ProductCardShowroom";

export default function Home() {
  return (
    <main className="showroom-shell">
      <header className="showroom-hero">
        <p className="showroom-eyebrow">MOMO PRODUCT LAB</p>
        <h1>商品卡 Showroom</h1>
        <p>在同一個畫面檢視商品卡，調整內容與外觀，快速確認每個細節。</p>
      </header>
      <ProductCardShowroom />
    </main>
  );
}
