import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { getFlaggedAuctions, resolveAuctionFlag } from "../../../services/staffService";
import "./index.scss";

const severityLabel = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const StaffAuctionModeration = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlaggedAuctions().then((data) => {
      setAuctions(data);
      setLoading(false);
    });
  }, []);

  const handleAction = async (auctionId, action) => {
    await resolveAuctionFlag(auctionId, action, "Đã xử lý bởi staff");
    setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
    toast.success(action === "approve" ? "Đã giữ phiên đấu giá" : "Đã tạm dừng phiên đấu giá");
  };

  return (
    <div className="stf-auctions">
      <StaffPageHeader
        kicker="Kiểm duyệt"
        title="Phiên đấu giá bị báo cáo"
        subtitle="Xem xét nội dung, mức độ báo cáo và quyết định giữ hoặc tạm dừng phiên."
      />

      {loading ? (
        <p className="stf-auctions__empty">Đang tải...</p>
      ) : (
        <div className="stf-auctions__table-wrap">
          <table className="stf-auctions__table">
            <thead>
              <tr>
                <th>Mã phiên</th>
                <th>Tiêu đề</th>
                <th>Người bán</th>
                <th>Giá hiện tại</th>
                <th>Báo cáo</th>
                <th>Lý do</th>
                <th>Mức độ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((auction) => (
                <tr key={auction.id}>
                  <td>{auction.id}</td>
                  <td>{auction.title}</td>
                  <td>{auction.seller}</td>
                  <td>{auction.currentBid}</td>
                  <td>{auction.reports}</td>
                  <td>{auction.reason}</td>
                  <td>
                    <span className={`stf-auctions__severity stf-auctions__severity--${auction.severity}`}>
                      {severityLabel[auction.severity]}
                    </span>
                  </td>
                  <td className="stf-auctions__actions">
                    <button type="button" onClick={() => handleAction(auction.id, "suspend")}>
                      Tạm dừng
                    </button>
                    <button type="button" className="keep" onClick={() => handleAction(auction.id, "approve")}>
                      Giữ phiên
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffAuctionModeration;
