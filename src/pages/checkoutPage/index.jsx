import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '@/components/homepage/header';
import Footer from '@/components/homepage/footer';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/utils/apiResponse';
import * as addressService from '@/services/addressService';
import CheckoutAddressCard from './components/checkoutAddressCard';
import CheckoutProductList from './components/checkoutProductList';
import CheckoutShipping, { SHIPPING_METHODS } from './components/checkoutShipping';
import CheckoutPayment from './components/checkoutPayment';
import CheckoutVoucherCard from './components/checkoutVoucherCard';
import CheckoutOrderSummary from './components/checkoutOrderSummary';
import './index.scss';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSelectedItems, getTotalPrice, removeItems } = useCart();
  const { createOrder } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0]);
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [customAddress, setCustomAddress] = useState(null);

  const selectedItems = getSelectedItems();
  const subtotal = getTotalPrice();
  const shippingFee = shippingMethod?.fee ?? 30000;
  const total = subtotal + shippingFee;

  const defaultAddress =
    addresses.find((item) => item.id === selectedAddressId) ||
    addressService.pickDefaultAddress(addresses);

  const activeAddress = customAddress || defaultAddress;

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
        const defAddr = addressService.pickDefaultAddress(list);
        setSelectedAddressId(defAddr?.id ?? null);
      } catch (err) {
        if (!cancelled) {
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

    if (!activeAddress || (!activeAddress.fullName && !activeAddress.recipientName)) {
      toast.error('Vui lòng nhập thông tin họ tên và địa chỉ nhận hàng');
      return;
    }

    setPlacing(true);
    try {
      await createOrder({
        items: selectedItems,
        subtotal,
        shippingFee,
        totalPrice: total,
        address: activeAddress,
        paymentMethod,
        shippingCarrier: shippingMethod?.name || 'Giao Hàng Nhanh (GHN)',
        note,
      });

      removeItems(selectedItems.map((i) => i.id));
      toast.success('Đặt hàng thành công!');
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
    <div className="checkout-haravan-page">
      <Header />

      <main className="checkout-haravan-page__main">
        <div className="checkout-haravan-page__shell">
          {!user && (
            <div className="checkout-banner-card">
              <span>Đăng nhập để mua hàng tiện lợi và nhận nhiều ưu đãi hơn nữa</span>
              <Link to="/login" className="checkout-banner-card__btn">
                Đăng nhập
              </Link>
            </div>
          )}

          <div className="checkout-haravan-page__grid">
            {/* LEFT COLUMN */}
            <div className="checkout-haravan-page__left">
              <CheckoutAddressCard
                address={activeAddress}
                addresses={addresses}
                loading={loadingAddress}
                selectedAddressId={selectedAddressId}
                onSelectAddress={(id) => {
                  setSelectedAddressId(id);
                  setCustomAddress(null);
                }}
                onAddressChange={(formData) => {
                  setCustomAddress(formData);
                }}
              />

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

              <div className="checkout-einvoice-card">
                <span>Hoá đơn điện tử</span>
                <button
                  type="button"
                  className="checkout-einvoice-card__btn"
                  onClick={() => toast.info('Chức năng yêu cầu xuất hóa đơn VAT')}
                >
                  Yêu cầu xuất &gt;
                </button>
              </div>

              <div className="checkout-note-card">
                <label className="checkout-note-card__label" htmlFor="checkout-note">
                  Ghi chú đơn hàng
                </label>
                <input
                  type="text"
                  id="checkout-note"
                  className="checkout-note-card__input"
                  placeholder="Nhập ghi chú cho đơn hàng..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* RIGHT COLUMN (STICKY SIDEBAR) */}
            <div className="checkout-haravan-page__right">
              <CheckoutProductList items={selectedItems} />

              <CheckoutVoucherCard onApplyVoucher={() => {}} />

              <CheckoutOrderSummary
                subtotal={subtotal}
                shippingFee={shippingFee}
                total={total}
                onPlaceOrder={handlePlaceOrder}
                placing={placing}
                disabled={placing}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


