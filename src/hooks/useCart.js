import { useContext } from 'react';
import { CartActionsContext, CartStateContext } from '../context/cartContexts';

export const useCart = () => {
  const state = useContext(CartStateContext);
  const actions = useContext(CartActionsContext);
  if (!state || !actions) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return { ...state, ...actions };
};

export const useCartActions = () => {
  const actions = useContext(CartActionsContext);
  if (!actions) {
    throw new Error('useCartActions must be used within a CartProvider');
  }
  return actions;
};
