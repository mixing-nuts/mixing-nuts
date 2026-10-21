import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { createProductStore } from './productStoreCore';

const PRODUCTS_COLLECTION = 'productos';

const mapProduct = (productDoc) => ({ id: productDoc.id, ...productDoc.data() });

const listenToProducts = (onProducts, onError) =>
  onSnapshot(
    query(collection(db, PRODUCTS_COLLECTION), where('activo', '==', true)),
    (snapshot) => onProducts(snapshot.docs.map(mapProduct)),
    onError
  );

export const productStore = createProductStore(listenToProducts);
