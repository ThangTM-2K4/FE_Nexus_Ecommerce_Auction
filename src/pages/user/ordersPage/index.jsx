import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useOrder } from '../../../context/OrderContext';
import * as orderService from '../../../services/orderService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import FilterTabs from '../../../components/profile/filterTabs';
import SearchField from '../../../components/profile/searchField';
import EmptyState from '../../../components/profile/emptyState';
import OrderList from '../../../components/profile/orderList';
import Modal from '../../../components/common/modal';
import { formatPrice } from '../../../utils/formatPrice';
import { toast } from 'react-toastify';
import './index.scss';

export default function OrdersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { orders, loading, refreshOrders } = useOrder();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [payingOrder, setPayingOrder] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnpCode = params.get('vnp_ResponseCode');
    const paymentReturn = params.get('payment_return') || params.get('payment');
    const statusParam = params.get('status');
    const orderId = params.get('orderId') || params.get('vnp_TxnRef');

    if (vnpCode || paymentReturn || statusParam) {
      if (vnpCode === '00' || statusParam === 'cho_xac_nhan' || paymentReturn === 'success') {
        if (user?.id) {
          // Explicitly update all pending_payment orders or target orderId to cho_xac_nhan
          orderService.getOrders(user.id).then((allOrders) => {
            const pendingOrders = allOrders.filter(o => o.status === 'pending_payment');
            pendingOrders.forEach(po => {
              orderService.markOrderPaid(user.id, po.id);
            });
            if (orderId) {
              orderService.markOrderPaid(user.id, orderId);
            }
            refreshOrders();
          });
        }
        toast.success('Thanh toán đơn hàng qua VNPay thành công! Đơn hàng đã được chuyển sang Chờ xác nhận.');
        setActiveTab('cho_xac_nhan');
      } else if (vnpCode && vnpCode !== '00') {
        toast.error('Thanh toán qua VNPay không thành công hoặc đã bị hủy.');
        setActiveTab('pending_payment');
      } else if (statusParam) {
        setActiveTab(statusParam);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (location.state?.status) {
      setActiveTab(location.state.status);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, location.state, user?.id, refreshOrders]);

  useEffect(() => {
    if (user?.id) {
      refreshOrders();
    }
  }, [user?.id, refreshOrders]);

  const handlePayNowWithWallet = async () => {
    if (!payingOrder || !user?.id) return;
    setProcessing(true);
    try {
      await orderService.payOrderWithWallet(user.id, payingOrder.id, payingOrder.total);
      await refreshOrders();
      toast.success(`Thanh toán đơn hàng #${payingOrder.id} thành công bằng Ví Nexus!`);
      setPayingOrder(null);
      setActiveTab('cho_xac_nhan');
    } catch {
      toast.error('Thanh toán thất bại, vui lòng thử lại');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayNowWithVNPay = async () => {
    if (!payingOrder) return;
    setProcessing(true);
    try {
      toast.info('Đang chuyển hướng sang Cổng thanh toán VNPay...');
      const paymentUrl = await orderService.initiateVnPayPayment(payingOrder.id, payingOrder.total);
      if (paymentUrl) {
        window.location.assign(paymentUrl);
      }
    } catch {
      toast.error('Không thể tạo liên kết thanh toán VNPay');
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (activeTab !== 'all') {
      list = list.filter((order) => order.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.shopName.toLowerCase().includes(q) ||
          order.products.some((p) => p.name.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout
          title="Đơn Mua"
          description="Theo dõi và quản lý đơn hàng của bạn"
        >
          <FilterTabs
            tabs={orderService.ORDER_STATUS_TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
          />

          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản Phẩm"
          />

          {loading && <p className="account-page__loading">Đang tải đơn hàng...</p>}

          {!loading && filteredOrders.length === 0 && (
            <EmptyState icon="🛍️" title="Chưa có đơn hàng" />
          )}

          {!loading && filteredOrders.length > 0 && (
            <OrderList orders={filteredOrders} onPayNow={(ord) => setPayingOrder(ord)} />
          )}
        </AccountLayout>
      </main>

      {/* Modal Thanh Toán Đơn Hàng Dang Chờ */}
      {payingOrder && (
        <Modal
          isOpen={Boolean(payingOrder)}
          onClose={() => setPayingOrder(null)}
          title={`Thanh toán đơn hàng #${payingOrder.id}`}
        >
          <div style={{ padding: '16px 0' }}>
            <p style={{ fontSize: '0.95rem', marginBottom: '12px', color: '#2d3748' }}>
              Tổng tiền đơn hàng: <strong style={{ color: '#ee4d2d', fontSize: '1.1rem' }}>{formatPrice(payingOrder.total)}</strong>
            </p>
            <p style={{ fontSize: '0.88rem', color: '#718096', marginBottom: '20px' }}>
              Số tiền bạn vừa nạp qua VNPay đã ở trong Ví Nexus. Bạn có thể dùng Ví Nexus để thanh toán ngay cho đơn hàng này!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                disabled={processing}
                onClick={handlePayNowWithWallet}
                style={{
                  backgroundColor: '#7c3aed',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                {processing ? 'Đang xử lý...' : '👛 Thanh toán bằng Ví Nexus (Đã có tiền ví)'}
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handlePayNowWithVNPay}
                style={{
                  backgroundColor: '#005baa',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                💳 Thanh toán lại qua Cổng VNPay
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}

