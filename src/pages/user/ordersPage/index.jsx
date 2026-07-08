import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as orderService from '../../../services/orderService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import FilterTabs from '../../../components/profile/filterTabs';
import SearchField from '../../../components/profile/searchField';
import EmptyState from '../../../components/profile/emptyState';
import OrderList from '../../../components/profile/orderList';
import './index.scss';

export default function OrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    orderService.getOrders(user.id, { status: activeTab, query: searchQuery }).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [user?.id, activeTab, searchQuery]);

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

          {!loading && orders.length === 0 && (
            <EmptyState icon="🛍️" title="Chưa có đơn hàng" />
          )}

          {!loading && orders.length > 0 && <OrderList orders={orders} />}
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
