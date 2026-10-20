import { useLocation, Link, Navigate } from 'react-router-dom';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import { formatPrice } from '../utils/formatPrice';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="order-success container section">
      <div className="order-success__card">
        <div className="order-success__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>

        <h1 className="order-success__title">¡Pedido generado!</h1>
        <p className="order-success__subtitle">
          Tu pedido <strong>{order.id}</strong> fue registrado correctamente.
        </p>

        <div className="order-success__summary">
          <h3 className="order-success__summary-title">Resumen del pedido</h3>
          {order.productos.map((item, i) => (
            <div key={i} className="order-success__item">
              <span>{item.nombre} x{item.cantidad}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className="order-success__total">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <p className="order-success__whatsapp-text">
          Para finalizar la compra, contactanos por WhatsApp con los datos de tu pedido.
        </p>

        <a
          href={generateWhatsAppUrl(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-lg order-success__whatsapp-btn"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.4-1.48-1.4-.02-.02-.149-.17-.17-.377-.02-.209.046-.392.146-.548.1-.149.148-.247.246-.39.147-.203.197-.324.296-.524.099-.2.05-.395-.05-.54-.1-.147-.4-.946-.55-1.29-.149-.338-.3-.289-.4-.289h-.347c-.15 0-.331.03-.5.15-.17.12-.57.53-.57 1.29s.59 1.5.67 1.6c.08.1 1.14 1.74 2.76 2.39.39.17.7.27.94.34.4.13.76.12 1.04.07.32-.05.97-.39 1.1-.77.14-.38.14-.7.1-.77-.04-.07-.17-.12-.36-.22Z"/>
          </svg>
          Finalizar pedido
        </a>

        <div className="order-success__actions">
          <Link to="/productos" className="btn btn-outline" title="Seguir comprando">
            Seguir comprando
          </Link>
          <Link to="/" className="btn btn-ghost" title="Volver al inicio">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
