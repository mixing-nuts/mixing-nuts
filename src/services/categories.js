import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const CATEGORIES_COLLECTION = 'categorias';

let cachedCategories = null;
let pendingRequest = null;

export const getAllCategories = async () => {
  if (cachedCategories) return cachedCategories;

  if (!pendingRequest) {
    pendingRequest = getDocs(query(collection(db, CATEGORIES_COLLECTION), orderBy('orden')))
      .then((snapshot) => {
        cachedCategories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return cachedCategories;
      })
      .finally(() => {
        pendingRequest = null;
      });
  }

  return pendingRequest;
};
