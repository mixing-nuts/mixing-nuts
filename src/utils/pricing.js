export const CASH_DISCOUNT_PERCENT = 5;

export const isCashPayment = (metodoPago) => metodoPago === 'efectivo';

export const getCashDiscount = (subtotal) => {
  const amount = Number(subtotal) || 0;
  if (amount <= 0) return 0;
  return Math.round((amount * CASH_DISCOUNT_PERCENT) / 100);
};

export const getOrderTotals = (subtotal, metodoPago) => {
  const base = Number(subtotal) || 0;
  const discount = isCashPayment(metodoPago) ? getCashDiscount(base) : 0;
  return {
    subtotal: base,
    discount,
    total: base - discount,
  };
};
