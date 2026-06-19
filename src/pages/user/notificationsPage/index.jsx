import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import * as notificationService from '../../../services/notificationService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import './index.scss';

const TYPE_LABELS = {
  auction: 'Đấu giá',
  order: 'Đơn hàng',
  system: 'Hệ thống',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
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

  const filtered = notifications.filter((n) => filter === 'all' || n.type === filter);
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
    <div className="notifications-page">
      <Header />
      <main className="notifications-main">
        <div className="notifications-header">
          <div>
            <Link to="/profile" className="notifications-back">← Quay lại hồ sơ</Link>
            <h1>Trung tâm thông báo</h1>
            <p>{unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}</p>
          </div>
          {unreadCount > 0 && (
            <button type="button" className="notifications-mark-all" onClick={handleMarkAll}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="notifications-tabs">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'auction', label: 'Đấu giá' },
            { key: 'order', label: 'Đơn hàng' },
            { key: 'system', label: 'Hệ thống' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={filter === tab.key ? 'active' : ''}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="notifications-list">
          {loading && <p className="notifications-empty">Đang tải...</p>}
          {!loading && filtered.length === 0 && (
            <p className="notifications-empty">Không có thông báo</p>
          )}
          {!loading &&
            filtered.map((item) => (
              <article key={item.id} className={`notifications-item ${item.read ? 'read' : 'unread'}`}>
                <div className="notifications-item-meta">
                  <span className={`notifications-type notifications-type--${item.type}`}>
                    {TYPE_LABELS[item.type]}
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
      </main>
      <Footer />
    </div>
  );
}
