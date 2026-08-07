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
import './index.scss';

import { toast } from 'react-toastify';

export default function OrdersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { orders, loading, refreshOrders } = useOrder();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnpCode = params.get('vnp_ResponseCode');
    const paymentReturn = params.get('payment_return') || params.get('payment');
    const statusParam = params.get('status');

    if (vnpCode || paymentReturn || statusParam) {
      if (vnpCode === '00' || statusParam === 'cho_xac_nhan' || paymentReturn === 'success') {
        toast.success('Thanh toán đơn hàng qua VNPay thành công! Đơn hàng của bạn đang được xử lý.');
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
  }, [location.search, location.state]);


  useEffect(() => {
    if (user?.id) {
      refreshOrders();
    }
  }, [user?.id, refreshOrders]);

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

          {!loading && filteredOrders.length > 0 && <OrderList orders={filteredOrders} />}
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
