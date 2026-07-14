import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaUserCheck,
  FaIdCard,
  FaGavel,
  FaFlag,
  FaShoppingCart,
  FaShieldAlt,
  FaCog,
} from "react-icons/fa";
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

const PREVIEW_LIMIT = 6;

const StaffNotificationBell = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const load = () => {
    getStaffNotifications().then(setItems);
  };

  useEffect(load, []);

  // Đóng khi click ra ngoài.
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items]);
  const preview = useMemo(() => items.slice(0, PREVIEW_LIMIT), [items]);

  const handleOpenItem = async (item) => {
    if (item.unread) {
      await markNotificationRead(item.id);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i)));
    }
    setOpen(false);
    if (item.link) navigate(item.link);
  };

  const handleMarkAll = async (e) => {
    e.stopPropagation();
    await markAllNotificationsRead();
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
  };

  const goToAll = () => {
    setOpen(false);
    navigate("/staff/notifications");
  };

  return (
    <div className="stf-notifbell" ref={wrapRef}>
      <button
        type="button"
        className="stf-notifbell__trigger"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="stf-notifbell__count">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="stf-notifbell__panel" role="dialog" aria-label="Lịch sử thông báo">
          <header className="stf-notifbell__head">
            <div>
              <strong>Thông báo</strong>
              {unreadCount > 0 && (
                <span className="stf-notifbell__head-badge">{unreadCount} chưa đọc</span>
              )}
            </div>
            <button
              type="button"
              className="stf-notifbell__markall"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
            >
              Đọc hết
            </button>
          </header>

          <ul className="stf-notifbell__list">
            {preview.length === 0 ? (
              <li className="stf-notifbell__empty">Không có thông báo nào.</li>
            ) : (
              preview.map((item) => {
                const Icon = typeIcon[item.type] || FaBell;
                return (
                  <li
                    key={item.id}
                    className={`stf-notifbell__item ${item.unread ? "unread" : ""}`}
                    onClick={() => handleOpenItem(item)}
                  >
                    <span className={`stf-notifbell__icon stf-notifbell__icon--${item.type}`}>
                      <Icon />
                    </span>
                    <div className="stf-notifbell__body">
                      <p className="stf-notifbell__title">{item.title}</p>
                      <p className="stf-notifbell__msg">{item.message}</p>
                      <span className="stf-notifbell__time">{item.time}</span>
                    </div>
                    {item.unread && <span className="stf-notifbell__dot" />}
                  </li>
                );
              })
            )}
          </ul>

          <button type="button" className="stf-notifbell__all" onClick={goToAll}>
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffNotificationBell;
