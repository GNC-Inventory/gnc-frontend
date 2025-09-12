import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SelectedProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  basePrice: number;
  stockLeft: number;
  make?: string;
  model?: string;
}

interface SelectionState {
  selectedProducts: Record<string, SelectedProduct>;
  isSelectionMode: boolean;
}

const initialState: SelectionState = {
  selectedProducts: {},
  isSelectionMode: false,
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    toggleProductSelection: (state, action: PayloadAction<SelectedProduct>) => {
      const productId = action.payload.id;
      if (state.selectedProducts[productId]) {
        delete state.selectedProducts[productId];
      } else {
        state.selectedProducts[productId] = action.payload;
      }
    },
    selectAllProducts: (state, action: PayloadAction<SelectedProduct[]>) => {
      action.payload.forEach(product => {
        state.selectedProducts[product.id] = product;
      });
    },
    clearAllSelections: (state) => {
      state.selectedProducts = {};
      state.isSelectionMode = false;
    },
    setSelectionMode: (state, action: PayloadAction<boolean>) => {
      state.isSelectionMode = action.payload;
    },
  },
});

export const { 
  toggleProductSelection, 
  selectAllProducts, 
  clearAllSelections, 
  setSelectionMode 
} = selectionSlice.actions;

export default selectionSlice.reducer;