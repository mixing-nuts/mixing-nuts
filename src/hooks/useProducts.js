import { useMemo, useSyncExternalStore } from 'react';
import { productStore } from '../services/productStore';

const subscribe = (onStoreChange) => {
  productStore.acquire();
  const unsubscribe = productStore.subscribe(onStoreChange);
  return () => {
    unsubscribe();
    productStore.release();
  };
};

const getSnapshot = () => productStore.getSnapshot();

export const useProducts = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const useFeaturedProducts = (limit = 4) => {
  const { products, loading, error } = useProducts();
  const featured = useMemo(
    () => products.filter((product) => product.destacado).slice(0, limit),
    [products, limit]
  );
  return { products: featured, loading, error };
};

export const useProductsByCategory = (category) => {
  const { products, loading, error } = useProducts();
  const filtered = useMemo(
    () => (category ? products.filter((product) => product.categoria === category) : products),
    [products, category]
  );
  return { products: filtered, loading, error };
};

export const useProductBySlug = (slug) => {
  const { products, loading, error } = useProducts();
  const product = useMemo(
    () => products.find((item) => item.slug === slug) || null,
    [products, slug]
  );
  return { product, loading, error };
};
