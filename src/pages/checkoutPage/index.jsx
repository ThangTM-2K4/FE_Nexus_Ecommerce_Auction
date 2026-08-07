import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '@/components/homepage/header';
import Footer from '@/components/homepage/footer';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { getApiErrorMessage } from '@/utils/apiResponse';
import * as addressService from '@/services/addressService';
import CheckoutAddressCard from './components/checkoutAddressCard';
import CheckoutProductList from './components/checkoutProductList';
import CheckoutShipping, { SHIPPING_METHODS } from './components/checkoutShipping';
import CheckoutPayment from './components/checkoutPayment';
import CheckoutOrderSummary from './components/checkoutOrderSummary';
import './index.scss';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { getSelectedItems, getTotalPrice, removeItems } = useCart();
  const { createOrder } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0]);
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const selectedItems = getSelectedItems();
  const subtotal = getTotalPrice();
  const shippingFee = shippingMethod?.fee ?? 30000;
  const total = subtotal + shippingFee;
  const address =
    addresses.find((item) => item.id === selectedAddressId) ||
    addressService.pickDefaultAddress(addresses);

  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [selectedItems.length, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadAddresses = async () => {
      setLoadingAddress(true);
      try {
        const list = await addressService.getAddresses();
        if (cancelled) return;
        setAddresses(list);
        const defaultAddr = addressService.pickDefaultAddress(list);
        setSelectedAddressId(defaultAddr?.id ?? null);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Không tải được địa chỉ nhận hàng'));
          setAddresses([]);
          setSelectedAddressId(null);
        }
      } finally {
        if (!cancelled) setLoadingAddress(false);
      }
    };

    loadAddresses();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) return;

    if (!address) {
      toast.error('Vui lòng thêm và chọn địa chỉ nhận hàng');
      return;
    }

    setPlacing(true);
    try {
      await createOrder({
        items: selectedItems,
        subtotal,
        shippingFee,
        totalPrice: total,
        address,
        paymentMethod,
        shippingCarrier: shippingMethod?.name || 'Giao Hàng Nhanh (GHN)',
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
            <CheckoutAddressCard
              address={address}
              addresses={addresses}
              loading={loadingAddress}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
            />
            <CheckoutProductList items={selectedItems} />
            <CheckoutShipping
              selectedMethodId={shippingMethod?.id}
              onSelectMethod={setShippingMethod}
            />
            <CheckoutPayment
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
              note={note}
              onNoteChange={setNote}
              totalAmount={total}
            />
            <CheckoutOrderSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              placing={placing}
              disabled={loadingAddress || !address}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

