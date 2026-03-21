export type ProductImage = {
  readonly src: string;
  readonly alt: string;
};

export type Product = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly nameEn: string;
  readonly price: number;
  readonly description: string;
  readonly category: string;
  readonly sizes: readonly string[];
  readonly images: readonly ProductImage[];
  readonly inStock: boolean;
  readonly isNew: boolean;
};

export type Category = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly nameEn: string;
  readonly description: string;
};

export type CartItem = {
  readonly product: Product;
  readonly size: string;
  readonly quantity: number;
};

export type CartState = {
  readonly items: readonly CartItem[];
};

export type CartAction =
  | { readonly type: 'ADD_ITEM'; readonly product: Product; readonly size: string; readonly quantity: number }
  | { readonly type: 'REMOVE_ITEM'; readonly productId: string; readonly size: string }
  | { readonly type: 'UPDATE_QUANTITY'; readonly productId: string; readonly size: string; readonly quantity: number }
  | { readonly type: 'CLEAR_CART' };
