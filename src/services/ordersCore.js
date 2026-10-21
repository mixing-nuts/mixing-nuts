import { collection, doc, runTransaction } from 'firebase/firestore';
import { getOrderTotals } from '../utils/pricing.js';

const ORDERS_COLLECTION = 'ordenes';
const PRODUCTS_COLLECTION = 'productos';

export const createOrderWithDb = async (db, order, cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('El carrito está vacío.');
  }

  const quantities = new Map();
  for (const item of cartItems) {
    const productId = typeof item.id === 'string' ? item.id.trim() : '';
    const quantity = Number(item.cantidad);
    if (!productId || productId.includes('/') || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('El carrito contiene un producto o cantidad no válidos.');
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }
  const orderRef = doc(collection(db, ORDERS_COLLECTION));
  const productRefs = [...quantities.keys()].map((id) => doc(db, PRODUCTS_COLLECTION, id));
  let savedOrder;

  await runTransaction(db, async (transaction) => {
    const snapshots = await Promise.all(productRefs.map((productRef) => transaction.get(productRef)));
    const orderItems = [];

    snapshots.forEach((snapshot) => {
      if (!snapshot.exists() || snapshot.data().activo !== true) {
        throw new Error('STOCK_INSUFFICIENT:producto');
      }

      const product = snapshot.data();
      const quantity = quantities.get(snapshot.id);
      const stock = Number(product.stock) || 0;
      const price = Number(product.precio);
      if (stock < quantity) throw new Error(`STOCK_INSUFFICIENT:${product.nombre || 'producto'}`);
      if (!Number.isFinite(price) || price < 0) throw new Error('PRODUCT_INVALID');

      orderItems.push({
        productId: snapshot.id,
        nombre: product.nombre,
        cantidad: quantity,
        precioUnitario: price,
        subtotal: price * quantity,
      });
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const { discount, total } = getOrderTotals(subtotal, order.metodoPago);
    savedOrder = {
      id: orderRef.id,
      cliente: order.cliente,
      entrega: order.entrega,
      productos: orderItems,
      subtotal,
      descuento: discount,
      total,
      metodoPago: order.metodoPago,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    snapshots.forEach((snapshot, index) => {
      const productRef = productRefs[index];
      transaction.update(productRef, {
        stock: (Number(snapshot.data().stock) || 0) - quantities.get(snapshot.id),
        ultimaReservaId: orderRef.id,
      });
    });
    transaction.set(orderRef, savedOrder);
  });

  return savedOrder;
};
