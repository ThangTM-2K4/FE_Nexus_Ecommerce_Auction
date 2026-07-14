import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCheck,
  FaIdCard,
  FaGavel,
  FaFlag,
  FaShoppingCart,
  FaShieldAlt,
  FaCog,
  FaBell,
} from "react-icons/fa";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import {
  getStaffNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../../services/staffService";
import "./index.scss";

const typeIcon = {
  seller: FaUserCheck,
  identity: FaIdCard,
  auction: FaGavel,
  dispute: FaFlag,
  order: FaShoppingCart,
  report: FaShieldAlt,
  system: FaCog,
};

const StaffNotifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const load = () => {
    getStaffNotifications().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items]);
  const shown = useMemo(
    () => (onlyUnread ? items.filter((i) => i.unread) : items),
    [items, onlyUnread]
  );

  const handleOpen = async (item) => {
    if (item.unread) {
      await markNotificationRead(item.id);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i)));
    }
    if (item.link) navigate(item.link);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
  };

  return (
    <div className="stf-notif">
      <StaffPageHeader
        kicker="Thông báo"
        title="Thông báo nội bộ"
        subtitle="Cập nhật công việc ưu tiên, cảnh báo vận hành và thông báo hệ thống."
      />

      <div className="stf-notif__bar">
        <div className="stf-notif__count">
          {unreadCount > 0 ? (
            <span className="stf-notif__badge">{unreadCount} chưa đọc</span>
          ) : (
            <span className="stf-notif__badge stf-notif__badge--done">Đã đọc hết</span>
          )}
        </div>
        <div className="stf-notif__bar-actions">
          <label className="stf-notif__toggle">
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(e) => setOnlyUnread(e.target.checked)}
            />
            Chỉ chưa đọc
          </label>
          <button type="button" onClick={handleMarkAll} disabled={unreadCount === 0}>
            Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>

      {loading ? (
        <p className="stf-notif__empty">Đang tải...</p>
      ) : shown.length === 0 ? (
        <p className="stf-notif__empty">Không có thông báo nào.</p>
      ) : (
        <ul className="stf-notif__list">
          {shown.map((item) => {
            const Icon = typeIcon[item.type] || FaBell;
            return (
              <li
                key={item.id}
                className={`stf-notif__item ${item.unread ? "unread" : ""} ${item.link ? "clickable" : ""}`}
                onClick={() => handleOpen(item)}
              >
                <span className={`stf-notif__icon stf-notif__icon--${item.type}`}>
                  <Icon />
                </span>
                <div className="stf-notif__body">
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </div>
                <div className="stf-notif__aside">
                  <span className="stf-notif__time">{item.time}</span>
                  {item.unread && <span className="stf-notif__dot" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default StaffNotifications;
