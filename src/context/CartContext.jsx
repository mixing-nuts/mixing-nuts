import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useProducts } from '../hooks/useProducts';
import { CartActionsContext, CartStateContext } from './cartContexts';
import { cartReducer } from './cartReducer';

const CART_STORAGE_KEY = 'mixing-nuts-cart';

const loadInitialItems = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, null, () => ({
    items: loadInitialItems(),
    toast: null,
  }));
  const { items, toast } = state;
  const { products, loading: productsLoading } = useProducts();

  useEffect(() => {
    if (productsLoading) return;
    dispatch({ type: 'sync', products });
  }, [products, productsLoading]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, quantity = 1) => dispatch({ type: 'add', product, quantity }), []);
  const removeFromCart = useCallback((productId) => dispatch({ type: 'remove', productId }), []);
  const increaseQuantity = useCallback((productId) => dispatch({ type: 'increase', productId }), []);
  const decreaseQuantity = useCallback((productId) => dispatch({ type: 'decrease', productId }), []);
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), []);

  const getCartTotal = useCallback(
    () => items.reduce((total, item) => total + item.precio * item.cantidad, 0),
    [items]
  );
  const getCartCount = useCallback(
    () => items.reduce((count, item) => count + item.cantidad, 0),
    [items]
  );

  const stateValue = useMemo(
    () => ({ items, toast, getCartTotal, getCartCount }),
    [items, toast, getCartTotal, getCartCount]
  );

  const actionsValue = useMemo(
    () => ({ addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart }),
    [addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart]
  );

  return (
    <CartActionsContext.Provider value={actionsValue}>
      <CartStateContext.Provider value={stateValue}>
        {children}
      </CartStateContext.Provider>
    </CartActionsContext.Provider>
  );
};
