import { ProductCardEmbed } from "@/components/product-card/ProductCardEmbed";

type EmbedPageProps = { params: Promise<{ cardId: string }> };

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { cardId } = await params;

  if (cardId !== "demo-food") {
    return (
      <main className="embed-shell" aria-label="商品卡錯誤">
        <section className="embed-error" role="alert">
          找不到商品：{cardId}
        </section>
      </main>
    );
  }

  return <ProductCardEmbed />;
}
