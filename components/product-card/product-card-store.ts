"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_PRODUCT_CARD } from "@/components/product-card/product-card.defaults";
import type { ProductCardConfig } from "@/components/product-card/product-card.types";
import { normalizeProductCardConfig } from "@/components/product-card/product-card.validation";

type ProductCardStore = {
  savedConfig: ProductCardConfig | null;
  hasHydrated: boolean;
  saveConfig: (config: ProductCardConfig) => void;
  clearConfig: () => void;
};

export const PRODUCT_CARD_STORAGE_KEY = "momo-card-showroom:v1";

let markHydrated: (() => void) | undefined;

export const useProductCardStore = create<ProductCardStore>()(
  persist(
    (set) => {
      markHydrated = () => set({ hasHydrated: true });

      return {
        savedConfig: null,
        hasHydrated: false,
        saveConfig: (config: ProductCardConfig) => set({ savedConfig: normalizeProductCardConfig(config) }),
        clearConfig: () => set({ savedConfig: null }),
      };
    },
    {
      name: PRODUCT_CARD_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ savedConfig: state.savedConfig ? normalizeProductCardConfig(state.savedConfig) : null }),
      merge: (persisted, current) => ({
        ...current,
        savedConfig: normalizeProductCardConfig((persisted as Partial<ProductCardStore> | undefined)?.savedConfig ?? DEFAULT_PRODUCT_CARD),
      }),
      onRehydrateStorage: () => () => markHydrated?.(),
    },
  ),
);
