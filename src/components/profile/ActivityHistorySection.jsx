import { useEffect, useState } from 'react';
import * as profileService from '../../services/profileService';

const TABS = [
  { key: 'auctions', label: 'Lịch sử đấu giá', id: 'auctions' },
  { key: 'bids', label: 'Lịch sử đặt giá', id: 'bids' },
  { key: 'purchases', label: 'Lịch sử mua hàng', id: 'purchases' },
  { key: 'transactions', label: 'Giao dịch', id: 'transactions' },
];

const formatPrice = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function ActivityHistorySection() {
  const [activeTab, setActiveTab] = useState('auctions');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService.getActivityHistory().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (TABS.some((t) => t.id === hash)) {
      setActiveTab(hash === 'auctions' ? 'auctions' : hash === 'purchases' ? 'purchases' : hash);
    }
  }, []);

  const renderTable = () => {
    if (loading) return <p className="profile-empty-hint">Đang tải...</p>;
    if (!data) return null;

    if (activeTab === 'auctions') {
      return (
        <table className="profile-table">
          <thead>
            <tr><th>Phiên đấu giá</th><th>Trạng thái</th><th>Giá</th><th>Ngày</th></tr>
          </thead>
          <tbody>
            {data.auctions.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td><span className={`profile-status profile-status--${row.status.toLowerCase()}`}>{row.status}</span></td>
                <td>{formatPrice(row.amount)}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'bids') {
      return (
        <table className="profile-table">
          <thead>
            <tr><th>Phiên đấu giá</th><th>Giá đặt</th><th>Trạng thái</th><th>Ngày</th></tr>
          </thead>
          <tbody>
            {data.bids.map((row) => (
              <tr key={row.id}>
                <td>{row.auction}</td>
                <td>{formatPrice(row.bidAmount)}</td>
                <td>{row.status}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'purchases') {
      return (
        <table className="profile-table">
          <thead>
            <tr><th>Sản phẩm</th><th>Giá</th><th>Trạng thái</th><th>Ngày</th></tr>
          </thead>
          <tbody>
            {data.purchases.map((row) => (
              <tr key={row.id}>
                <td>{row.product}</td>
                <td>{formatPrice(row.price)}</td>
                <td>{row.status}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="profile-table">
        <thead>
          <tr><th>Loại</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày</th></tr>
        </thead>
        <tbody>
          {data.transactions.map((row) => (
            <tr key={row.id}>
              <td>{row.type}</td>
              <td className={row.amount < 0 ? 'negative' : 'positive'}>{formatPrice(row.amount)}</td>
              <td>{row.status}</td>
              <td>{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <section className="profile-section" id="activity">
      <div className="profile-section-header">
        <h2>Lịch sử hoạt động</h2>
      </div>

      <div className="profile-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-table-wrap">{renderTable()}</div>
    </section>
  );
}
