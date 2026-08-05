import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPlus, FaTimes, FaMapMarkerAlt, FaCheckCircle, FaShieldAlt, FaMedal } from "react-icons/fa";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { getAuctionProposals } from "../../../services/auctionProposalService";
import { useAuth } from "../../../context/AuthContext";
import * as profileService from "../../../services/profileService";
import "./index.scss";

export default function AuctionSellerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const setTab = (t) => {
    setSearchParams(prev => {
      if (t === 'all') prev.delete('tab');
      else prev.set('tab', t);
      return prev;
    });
  };
  const [selectedUpcoming, setSelectedUpcoming] = useState(null);
  const [realAuctions, setRealAuctions] = useState([]);

  useEffect(() => {
    if (user?.id) {
      profileService.getProfile(user.id).then(setProfile).catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    async function loadProposals() {
      const localItems = JSON.parse(localStorage.getItem("auc_my_proposals") || "[]").map(p => ({
        id: p.id,
        title: p.title,
        image: p.image || "/images/auction/default.png",
        status: p.status || { label: "Chờ duyệt", type: "upcoming", color: "orange" },
        bids: 0,
        price: `${(p.startingPrice || 0).toLocaleString()}đ`,
        timeLeft: "Đang chờ Admin duyệt",
      }));

      try {
        const res = await getAuctionProposals();
        const apiItems = (res?.items || []).map(p => ({
          id: p.id,
          title: p.title,
          image: p.imageUrl || "/images/auction/default.png",
          status: { label: p.status || "Chờ duyệt", type: "upcoming", color: "orange" },
          bids: 0,
          price: `${(p.startingPrice || 0).toLocaleString()}đ`,
          timeLeft: "Đang chờ Admin duyệt",
        }));
        setRealAuctions([...localItems, ...apiItems]);
      } catch {
        setRealAuctions(localItems);
      }
    }
    loadProposals();
  }, []);

  const filteredAuctions = realAuctions.filter((item) => {
    if (tab === "all") return true;
    return item.status.type === tab;
  });

  const dynamicStats = [
    { label: "TỔNG ĐỀ XUẤT", value: String(realAuctions.length), sub: "Phiên đã tạo" },
    { label: "ĐANG CHỜ DUYỆT", value: String(realAuctions.filter(a => a.status?.label === "Chờ duyệt").length), sub: "Chờ Admin phê duyệt" },
    { label: "ĐANG HOẠT ĐỘNG", value: String(realAuctions.filter(a => a.status?.type === "active").length), sub: "Phiên đang live" },
  ];

  const fullName = profile?.fullName || user?.fullName || user?.name || "Thành viên Nexus";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || user?.phone || "";
  const address = profile?.address || user?.address || "Việt Nam";
  const isCccdVerified = profile?.isNationalIdVerified || profile?.identityStatus === "APPROVED";

  return (
    <AuctionSidebarLayout sidebarActive="auctions">
      <div className="auc-seller">
        {/* User Hero Banner */}
        <div className="auc-profile-hero" style={{ marginBottom: '24px' }}>
          <div className="auc-profile-hero__main">
            <div className="auc-profile-hero__avatar-wrap">
              <AuctionImage
                src={profile?.avatar || user?.avatar || "/images/avatars/default.png"}
                alt={fullName}
                className="auc-profile-hero__avatar"
              />
              <span className="auc-profile-hero__avatar-badge" title="Tài khoản chính thức">
                ✓
              </span>
            </div>

            <div className="auc-profile-hero__details">
              <div className="name-badge-row">
                <h2>{fullName}</h2>
                <span className="user-role-badge">
                  <FaMedal style={{ color: "#C3A05D" }} /> Seller (Người bán)
                </span>
              </div>
              <p className="email-phone-meta">
                <span>{email}</span> • <span>{phone || "Chưa cập nhật SĐT"}</span>
              </p>

              <div className="meta-tags">
                <span className="meta-tag">
                  <FaMapMarkerAlt /> {address}
                </span>
                {isCccdVerified ? (
                  <span className="meta-tag meta-tag--verified">
                    <FaCheckCircle /> Đã xác minh CCCD/CMND
                  </span>
                ) : (
                  <span className="meta-tag meta-tag--unverified">
                    <FaShieldAlt /> Chưa xác minh CCCD
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="auc-seller__header">
          <div>
            <h1>Tổng quan người bán</h1>
            <p>Quản lý các sản phẩm đấu giá và theo dõi doanh thu của bạn.</p>
          </div>
          <button
            type="button"
            className="auc-seller__create"
            onClick={() => navigate("/auction/create")}
          >
            <FaPlus /> Tạo đấu giá mới
          </button>
        </div>

        <div className="auc-seller__stats">
          {dynamicStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span className="stat-card__label">{stat.label}</span>
              <span className="stat-card__value">{stat.value}</span>
              {stat.sub && (
                <span className="stat-card__sub">{stat.sub}</span>
              )}
            </div>
          ))}
        </div>

        <section className="auc-seller__table-section">
          <h2>Đấu giá của bạn</h2>

          <div className="auc-seller__tabs">
            {[
              { id: "all", label: "Tất cả" },
              { id: "active", label: "Đang diễn ra" },
              { id: "upcoming", label: "Chuẩn bị đấu giá" },
              { id: "ended", label: "Đã kết thúc" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="auc-seller__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SẢN PHẨM</th>
                  <th>TRẠNG THÁI</th>
                  <th>LƯỢT BID</th>
                  <th>GIÁ HIỆN TẠI</th>
                  <th>THỜI GIAN CÒN LẠI</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuctions.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => item.status.type === 'upcoming' && setSelectedUpcoming(item)}
                    style={{ cursor: item.status.type === 'upcoming' ? 'pointer' : 'default' }}
                    title={item.status.type === 'upcoming' ? "Bấm vào để xem người đã đăng ký" : ""}
                  >
                    <td className="product-cell">
                      <AuctionImage src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status status--${item.status.type}`}>
                        {item.status.label}
                      </span>
                    </td>
                    <td>
                      {item.status.type === 'upcoming' 
                        ? `${item.registeredUsers?.length || 0} đăng ký` 
                        : item.bids}
                    </td>
                    <td className="price">{item.currentPrice}</td>
                    <td className="time">{item.timeLeft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="auc-seller__view-all">
            Xem tất cả đấu giá
          </button>
        </section>
      </div>

      {selectedUpcoming && (
        <div className="auc-seller__modal-overlay" onClick={() => setSelectedUpcoming(null)}>
          <div className="auc-seller__modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Người đã đăng ký tham gia</h3>
              <button type="button" onClick={() => setSelectedUpcoming(null)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="modal-product">
                <AuctionImage src={selectedUpcoming.image} alt={selectedUpcoming.name} />
                <div>
                  <strong>{selectedUpcoming.name}</strong>
                  <span>{selectedUpcoming.code}</span>
                </div>
              </div>
              <ul className="registered-list">
                {selectedUpcoming.registeredUsers && selectedUpcoming.registeredUsers.length > 0 ? (
                  selectedUpcoming.registeredUsers.map(user => (
                    <li key={user.id} onClick={() => navigate('/auction/profile')}>
                      <AuctionImage src={user.avatar} alt={user.name} />
                      <div>
                        <strong>{user.name}</strong>
                        <span>Đăng ký {user.time}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="no-data">Chưa có người đăng ký nào.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </AuctionSidebarLayout>
  );
}

