import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as notificationService from '../../../services/notificationService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import FilterTabs from '../../../components/profile/filterTabs';
import EmptyState from '../../../components/profile/emptyState';
import '../ordersPage/index.scss';
import './index.scss';

const NOTIFICATION_TABS = [
  { key: 'order', label: 'Cập nhật đơn hàng', types: ['order'] },
  { key: 'promotion', label: 'Khuyến mãi', types: ['promotion', 'system'] },
  { key: 'auction', label: 'Đấu giá', types: ['auction'] },
];

const TYPE_LABELS = {
  auction: 'Đấu giá',
  order: 'Đơn hàng',
  promotion: 'Khuyến mãi',
  system: 'Hệ thống',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('order');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await notificationService.getNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const currentTab = NOTIFICATION_TABS.find((tab) => tab.key === activeTab);
  const filtered = useMemo(() => {
    if (!currentTab) return notifications;
    return notifications.filter((n) => currentTab.types.includes(n.type));
  }, [notifications, currentTab]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    const updated = await notificationService.markAsRead(user.id, id);
    setNotifications(updated);
  };

  const handleMarkAll = async () => {
    const updated = await notificationService.markAllAsRead(user.id);
    setNotifications(updated);
  };

  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout
          title="Thông Báo"
          description={unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
        >
          <div className="notifications-toolbar">
            {unreadCount > 0 && (
              <button type="button" className="notifications-mark-all" onClick={handleMarkAll}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <FilterTabs
            tabs={NOTIFICATION_TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
          />

          <div className="notifications-list">
            {loading && <p className="account-page__loading">Đang tải...</p>}

            {!loading && filtered.length === 0 && (
              <EmptyState icon="🔔" title="Không có thông báo" />
            )}

            {!loading &&
              filtered.map((item) => (
                <article key={item.id} className={`notifications-item ${item.read ? 'read' : 'unread'}`}>
                  <div className="notifications-item-meta">
                    <span className={`notifications-type notifications-type--${item.type}`}>
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                    <time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>
                  {!item.read && (
                    <button type="button" onClick={() => handleMarkRead(item.id)}>
                      Đánh dấu đã đọc
                    </button>
                  )}
                </article>
              ))}
          </div>
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
