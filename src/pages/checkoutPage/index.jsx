import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '@/components/homepage/header';
import Footer from '@/components/homepage/footer';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { getApiErrorMessage } from '@/utils/apiResponse';
import { getDefaultCheckoutAddress } from '@/data/mockDefaultAddress';
import { MOCK_SHIPPING_FEE } from '@/data/mockCheckout';
import CheckoutAddressCard from './components/checkoutAddressCard';
import CheckoutProductList from './components/checkoutProductList';
import CheckoutPayment from './components/checkoutPayment';
import CheckoutOrderSummary from './components/checkoutOrderSummary';
import './index.scss';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { getSelectedItems, getTotalPrice, removeItems } = useCart();
  const { createOrder } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);

  const selectedItems = getSelectedItems();
  const subtotal = getTotalPrice();
  const shippingFee = MOCK_SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const address = getDefaultCheckoutAddress();

  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [selectedItems.length, navigate]);

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) return;

    setPlacing(true);
    try {
      await createOrder({
        items: selectedItems,
        subtotal,
        shippingFee,
        totalPrice: total,
        address,
        paymentMethod,
        note,
      });

      removeItems(selectedItems.map((i) => i.id));
      toast.success('Đặt hàng thành công');
      navigate('/profile/orders', { state: { status: 'cho_xac_nhan' } });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại'));
    } finally {
      setPlacing(false);
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <Header />

      <main className="checkout-page__main">
        <div className="checkout-page__shell">
          <h1 className="checkout-page__title">Thanh Toán</h1>

          <div className="checkout-page__content">
            <CheckoutAddressCard address={address} />
            <CheckoutProductList items={selectedItems} />
            <CheckoutPayment
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
              note={note}
              onNoteChange={setNote}
            />
            <CheckoutOrderSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              placing={placing}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
