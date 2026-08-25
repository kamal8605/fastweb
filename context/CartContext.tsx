"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
  parent_id?: number | null;
  parent_name?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, qty: number) => void;
  updateQty: (product_id: number, qty: number) => void;
  removeItem: (product_id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "fastweb_cart";
const EMPTY_CART: CartItem[] = [];
const cartListeners = new Set<() => void>();
let cachedRawCart: string | null | undefined;
let cachedCartItems: CartItem[] = EMPTY_CART;

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === cachedRawCart) return cachedCartItems;

    cachedRawCart = stored;
    if (!stored) {
      cachedCartItems = EMPTY_CART;
      return cachedCartItems;
    }

    const parsed: unknown = JSON.parse(stored);
    cachedCartItems = Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY_CART;
    return cachedCartItems;
  } catch {
    return cachedCartItems;
  }
}

function getServerCartSnapshot() {
  return EMPTY_CART;
}

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      cachedRawCart = undefined;
      listener();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => {
    cartListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function writeCartItems(items: CartItem[]) {
  const serialized = JSON.stringify(items);
  cachedRawCart = serialized;
  cachedCartItems = items;

  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Keep the in-memory cart usable when browser storage is unavailable.
  }

  cartListeners.forEach((listener) => listener());
}

export function clearStoredCart() {
  cachedRawCart = null;
  cachedCartItems = EMPTY_CART;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The in-memory cart is still cleared when browser storage is unavailable.
  }

  cartListeners.forEach((listener) => listener());
}

function updateCartItems(updater: (items: CartItem[]) => CartItem[]) {
  writeCartItems(updater(getCartSnapshot()));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty: number) => {
      updateCartItems((prev) => {
        const existing = prev.find((i) => i.product_id === item.product_id);
        if (existing) {
          return prev.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + qty }
              : i
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const updateQty = useCallback((product_id: number, qty: number) => {
    if (qty <= 0) {
      updateCartItems((prev) => prev.filter((i) => i.product_id !== product_id));
    } else {
      updateCartItems((prev) =>
        prev.map((i) =>
          i.product_id === product_id ? { ...i, quantity: qty } : i
        )
      );
    }
  }, []);

  const removeItem = useCallback((product_id: number) => {
    updateCartItems((prev) => prev.filter((i) => i.product_id !== product_id));
  }, []);

  const clearCart = useCallback(() => clearStoredCart(), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, updateQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
