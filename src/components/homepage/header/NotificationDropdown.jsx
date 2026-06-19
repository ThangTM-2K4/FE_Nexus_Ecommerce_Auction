import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import * as notificationService from '../../../services/notificationService';

const TYPE_LABELS = {
  auction: 'Đấu giá',
  order: 'Đơn hàng',
  system: 'Hệ thống',
};

export default function NotificationDropdown({ onClose }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const panelRef = useRef(null);

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    const updated = await notificationService.markAsRead(user.id, id);
    setNotifications(updated);
  };

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead(user.id);
    setNotifications(updated);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="header-notif-panel" ref={panelRef} role="dialog" aria-label="Thông báo">
      <div className="header-notif-header">
        <h3>Thông báo {unreadCount > 0 && <span className="header-notif-count">{unreadCount}</span>}</h3>
        {unreadCount > 0 && (
          <button type="button" className="header-notif-mark-all" onClick={handleMarkAllRead}>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="header-notif-tabs">
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

      <div className="header-notif-list">
        {loading && <p className="header-notif-empty">Đang tải...</p>}
        {!loading && filtered.length === 0 && (
          <p className="header-notif-empty">Không có thông báo</p>
        )}
        {!loading &&
          filtered.map((item) => (
            <div
              key={item.id}
              className={`header-notif-item ${item.read ? 'read' : 'unread'}`}
            >
              <div className="header-notif-item-top">
                <span className={`header-notif-type header-notif-type--${item.type}`}>
                  {TYPE_LABELS[item.type]}
                </span>
                <time>{formatDate(item.createdAt)}</time>
              </div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              {!item.read && (
                <button
                  type="button"
                  className="header-notif-read-btn"
                  onClick={() => handleMarkRead(item.id)}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          ))}
      </div>

      <Link to="/profile/notifications" className="header-notif-view-all" onClick={onClose}>
        Xem tất cả thông báo
      </Link>
    </div>
  );
}
