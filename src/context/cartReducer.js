const createToast = (message, type) => ({ message, type, id: Date.now() });

export const sameItems = (a, b) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      item.id === other.id &&
      item.cantidad === other.cantidad &&
      item.precio === other.precio &&
      item.stock === other.stock
    );
  });
};

export const cartReducer = (state, action) => {
  switch (action.type) {
    case 'add': {
      const { product, quantity = 1 } = action;
      const availableStock = Math.max(0, Number(product.stock) || 0);

      if (availableStock < 1) {
        return { ...state, toast: createToast('Este producto ya no tiene stock disponible', 'error') };
      }

      const existing = state.items.find((item) => item.id === product.id);
      if (existing && existing.cantidad >= availableStock) {
        return { ...state, toast: createToast(`Solo hay ${availableStock} unidad(es) disponible(s)`, 'error') };
      }

      const items = existing
        ? state.items.map((item) =>
            item.id === product.id
              ? { ...item, cantidad: Math.min(item.cantidad + quantity, availableStock) }
              : item
          )
        : [...state.items, { ...product, cantidad: Math.min(quantity, availableStock) }];

      return { ...state, items, toast: createToast(`${product.nombre} agregado al carrito`, 'success') };
    }

    case 'remove':
      return { ...state, items: state.items.filter((item) => item.id !== action.productId) };

    case 'increase':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.productId
            ? { ...item, cantidad: Math.min(item.cantidad + 1, Math.max(0, Number(item.stock) || 0)) }
            : item
        ),
      };

    case 'decrease':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.productId ? { ...item, cantidad: Math.max(item.cantidad - 1, 1) } : item
        ),
      };

    case 'clear':
      return { ...state, items: [] };

    case 'sync': {
      if (action.products.length === 0) return state;

      const productsById = new Map(action.products.map((product) => [product.id, product]));
      const items = state.items
        .map((item) => {
          const currentProduct = productsById.get(item.id);
          if (!currentProduct) return null;
          const stock = Math.max(0, Number(currentProduct.stock) || 0);
          return { ...item, ...currentProduct, cantidad: Math.min(item.cantidad, stock) };
        })
        .filter((item) => item && item.cantidad > 0);

      return sameItems(state.items, items) ? state : { ...state, items };
    }

    default:
      return state;
  }
};
