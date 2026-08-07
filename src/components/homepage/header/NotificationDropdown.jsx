import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as notificationService from "../../../services/notificationService";

const TYPE_LABELS = {
  auction: "Đấu giá",
  order: "Đơn hàng",
  system: "Hệ thống",
};

const NOTIFICATION_TRANSLATIONS = {
  'Seller application approved.': 'Yêu cầu đăng ký người bán đã được phê duyệt.',
  'Seller application submitted.': 'Hồ sơ đăng ký người bán đã được gửi.',
  'Seller registration submitted.': 'Hồ sơ đăng ký người bán đã được gửi.',
  'Phone verification code requested.': 'Đã gửi yêu cầu mã xác thực số điện thoại.',
  'Account registration completed.': 'Đăng ký tài khoản thành công.',
  'Seller application created.': 'Đã tạo hồ sơ đăng ký người bán.',
  'Identity verification submitted.': 'Đã gửi xác thực danh tính.',
  'Identity verification approved.': 'Xác thực danh tính đã được phê duyệt.',
};

function translateNotificationText(text) {
  if (!text) return '';
  const trimmed = String(text).trim();
  if (NOTIFICATION_TRANSLATIONS[trimmed]) {
    return NOTIFICATION_TRANSLATIONS[trimmed];
  }
  return trimmed
    .replace(/^Seller application approved\.?/i, 'Yêu cầu đăng ký người bán đã được phê duyệt.')
    .replace(/^Seller application submitted\.?/i, 'Hồ sơ đăng ký người bán đã được gửi.')
    .replace(/^Seller registration submitted\.?/i, 'Hồ sơ đăng ký người bán đã được gửi.')
    .replace(/^Phone verification code requested\.?/i, 'Đã gửi yêu cầu mã xác thực số điện thoại.')
    .replace(/^Account registration completed\.?/i, 'Đăng ký tài khoản thành công.');
}

function normalizeNotification(item) {
  return {
    ...item,
    id: item.id ?? item.notificationId,
    type: String(item.type ?? item.notificationType ?? "system").toLowerCase(),
    title: translateNotificationText(item.title ?? "Thông báo"),
    message: translateNotificationText(item.message ?? item.content ?? item.body ?? ""),
    read: item.isRead ?? item.read ?? false,
    createdAt: item.createdAt ?? item.sentAt ?? item.occurredAt,
  };
}


export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const panelRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await notificationService.getNotifications({
        pageNumber: 1,
        pageSize: 20,
      });

      setNotifications(data.map(normalizeNotification));
    } catch (exception) {
      console.error(
        "[NotificationDropdown] Failed to load notifications",
        exception,
      );

      setError("Không thể tải thông báo.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const filtered = notifications.filter(
    (notification) => filter === "all" || notification.type === filter,
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                read: true,
                isRead: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("[NotificationDropdown] Mark as read failed", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          read: true,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("[NotificationDropdown] Mark all as read failed", error);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="header-notif-panel"
      ref={panelRef}
      role="dialog"
      aria-label="Thông báo"
    >
      <div className="header-notif-header">
        <h3>
          Thông báo
          {unreadCount > 0 && (
            <span className="header-notif-count">{unreadCount}</span>
          )}
        </h3>

        {unreadCount > 0 && (
          <button
            type="button"
            className="header-notif-mark-all"
            onClick={handleMarkAllRead}
            title="Backend chưa hỗ trợ đánh dấu tất cả đã đọc"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="header-notif-tabs">
        {[
          { key: "all", label: "Tất cả" },
          { key: "auction", label: "Đấu giá" },
          { key: "order", label: "Đơn hàng" },
          { key: "system", label: "Hệ thống" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={filter === tab.key ? "active" : ""}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="header-notif-list">
        {loading && <p className="header-notif-empty">Đang tải...</p>}

        {!loading && error && <p className="header-notif-empty">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="header-notif-empty">Không có thông báo</p>
        )}

        {!loading &&
          !error &&
          filtered.map((item) => (
            <div
              key={item.id}
              className={`header-notif-item ${item.read ? "read" : "unread"}`}
            >
              <div className="header-notif-item-top">
                <span
                  className={`header-notif-type header-notif-type--${item.type}`}
                >
                  {TYPE_LABELS[item.type] ?? TYPE_LABELS.system}
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
                  title="Backend chưa hỗ trợ đánh dấu đã đọc"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          ))}
      </div>

      <Link
        to="/profile/notifications"
        className="header-notif-view-all"
        onClick={onClose}
      >
        Xem tất cả thông báo
      </Link>
    </div>
  );
}
