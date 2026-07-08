import OrderCard from '../orderCard';
import './index.scss';

export default function OrderList({ orders = [] }) {
  return (
    <div className="account-order-list">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
