import { PRODUCT_IMAGE_OPTIONS } from "@/components/product-card/product-card.defaults";
import { PRODUCT_CARD_BADGES, type ProductCardBadge, type ProductCardEditorValues } from "@/components/product-card/product-card.types";

type ProductCardEditorProps = {
  values: ProductCardEditorValues;
  onFieldChange: (field: keyof ProductCardEditorValues, value: string) => void;
  onBadgeChange: (badge: ProductCardBadge, checked: boolean) => void;
};

export function ProductCardEditor({ values, onFieldChange, onBadgeChange }: ProductCardEditorProps) {
  return (
    <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
      <fieldset className="editor-section">
        <legend>內容</legend>
        <label>商品圖片<select value={values.imageId} onChange={(event) => onFieldChange("imageId", event.target.value)}>{PRODUCT_IMAGE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
        <label>圖片替代文字<input value={values.imageAlt} onChange={(event) => onFieldChange("imageAlt", event.target.value)} /></label>
        <label>促銷文案<input value={values.promotion} onChange={(event) => onFieldChange("promotion", event.target.value)} /></label>
        <label>商品名稱<textarea rows={3} value={values.title} onChange={(event) => onFieldChange("title", event.target.value)} /></label>
        <div className="editor-columns">
          <label>售價<input inputMode="numeric" value={values.price} onChange={(event) => onFieldChange("price", event.target.value)} /></label>
          <label>原價<input inputMode="numeric" value={values.originalPrice} onChange={(event) => onFieldChange("originalPrice", event.target.value)} /></label>
        </div>
        <label>總銷量<input value={values.salesText} onChange={(event) => onFieldChange("salesText", event.target.value)} /></label>
        <label>評論數<input inputMode="numeric" value={values.reviewCount} onChange={(event) => onFieldChange("reviewCount", event.target.value)} /></label>
        <fieldset className="badge-fieldset"><legend>Badges</legend>{PRODUCT_CARD_BADGES.map((badge) => <label className="badge-option" key={badge}><input checked={values.badges.includes(badge)} type="checkbox" onChange={(event) => onBadgeChange(badge, event.target.checked)} />{badge}</label>)}</fieldset>
      </fieldset>
      <fieldset className="editor-section">
        <legend>外觀</legend>
        <label>Accent color<input aria-label="Accent color" value={values.accentColor} onChange={(event) => onFieldChange("accentColor", event.target.value)} /></label>
        <label>圓角<input inputMode="numeric" value={values.borderRadius} onChange={(event) => onFieldChange("borderRadius", event.target.value)} /></label>
      </fieldset>
    </form>
  );
}
