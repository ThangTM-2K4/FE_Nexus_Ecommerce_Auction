import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getStaffAuctions, getStaffAuctionDetail } from "../../../services/staffService";
import "./index.scss";

const StaffAuctionsLookup = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getStaffAuctions().then((data) => {
      setAuctions(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(
    () => ({
      total: auctions.length,
      live: auctions.filter((a) => a.status === "Đang diễn ra" || a.status === "Sắp kết thúc").length,
      done: auctions.filter((a) => a.status === "Hoàn thành").length,
      bids: auctions.reduce((s, a) => s + (a.bids || 0), 0),
    }),
    [auctions]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auctions;
    return auctions.filter((a) =>
      [a.id, a.title, a.seller, a.winner].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [auctions, query]);

  const openDetail = async (auction) => {
    setDetailLoading(true);
    setDetail({ ...auction, bids: [] });
    const full = await getStaffAuctionDetail(auction.id);
    setDetail(full);
    setDetailLoading(false);
  };

  return (
    <div className="stf-auction-lookup">
      <StaffPageHeader
        kicker="Tra cứu"
        title="Phiên đấu giá"
        subtitle="Xem danh sách phiên và lịch sử bid — không được tạo, sửa hoặc huỷ phiên."
      />

      <div className="stf-auction-lookup__kpis">
        <StaffKpiCard label="Tổng phiên" value={String(stats.total)} hint="Toàn nền tảng" />
        <StaffKpiCard label="Đang diễn ra" value={String(stats.live)} hint="Live + sắp kết thúc" highlight />
        <StaffKpiCard label="Hoàn thành" value={String(stats.done)} hint="Đã có kết quả" />
        <StaffKpiCard label="Tổng lượt bid" value={String(stats.bids)} hint="Tất cả phiên" />
      </div>

      <div className="stf-auction-lookup__toolbar">
        <input
          type="search"
          placeholder="Tìm mã phiên, tiêu đề, seller..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="stf-auction-lookup__empty">Đang tải...</p>
      ) : (
        <div className="stf-auction-lookup__table-wrap">
          <table className="stf-auction-lookup__table">
            <thead>
              <tr>
                <th>Mã phiên</th>
                <th>Tiêu đề</th>
                <th>Seller</th>
                <th>Giá hiện tại</th>
                <th>Lượt bid</th>
                <th>Kết thúc</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td><code>{a.id}</code></td>
                  <td><strong>{a.title}</strong></td>
                  <td>{a.seller}</td>
                  <td>{a.currentPrice}</td>
                  <td>{a.bids}</td>
                  <td>{a.endTime}</td>
                  <td><span className="stf-auction-lookup__status">{a.status}</span></td>
                  <td>
                    <button type="button" className="stf-auction-lookup__view" onClick={() => openDetail(a)}>
                      Xem + Bid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="stf-auction-lookup__overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-auction-lookup__panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <header>
              <div>
                <small>{detail.id}</small>
                <h3>{detail.title}</h3>
              </div>
              <button type="button" onClick={() => setDetail(null)}>✕</button>
            </header>

            <dl className="stf-auction-lookup__meta">
              <dt>Seller</dt><dd>{detail.seller}</dd>
              <dt>Giá khởi điểm</dt><dd>{detail.startPrice}</dd>
              <dt>Giá hiện tại</dt><dd>{detail.currentPrice}</dd>
              <dt>Người thắng</dt><dd>{detail.winner}</dd>
              <dt>Trạng thái</dt><dd>{detail.status}</dd>
              <dt>Kết thúc</dt><dd>{detail.endTime}</dd>
            </dl>

            <section>
              <h4>Lịch sử đấu giá (Bid History)</h4>
              {detailLoading ? (
                <p className="stf-auction-lookup__empty">Đang tải lịch sử bid...</p>
              ) : detail.bids?.length ? (
                <table className="stf-auction-lookup__bid-table">
                  <thead>
                    <tr>
                      <th>Mã bid</th>
                      <th>Người bid</th>
                      <th>Số tiền</th>
                      <th>Thời gian</th>
                      <th>IP</th>
                      <th>Nghi ngờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.bids.map((b) => (
                      <tr key={b.id} className={b.suspicious ? "suspicious" : ""}>
                        <td><code>{b.id}</code></td>
                        <td>{b.bidder}</td>
                        <td>{b.amount}</td>
                        <td>{b.bidTime}</td>
                        <td>{b.ip}</td>
                        <td>{b.suspicious ? "⚠ Có" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="stf-auction-lookup__empty">Chưa có lượt bid nào.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAuctionsLookup;
