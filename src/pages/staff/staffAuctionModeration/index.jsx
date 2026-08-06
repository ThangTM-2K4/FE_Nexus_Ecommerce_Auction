import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { getFlaggedAuctions, resolveAuctionFlag } from "../../../services/staffService";
import { getAuctionProposals } from "../../../services/auctionProposalService";
import { approveAuctionProposal, rejectAuctionProposal } from "../../../services/adminAuctionService";
import "./index.scss";

const severityLabel = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const PROPOSAL_STATUS_LABEL = {
  PENDING_REVIEW: "Chờ duyệt",
  SUBMITTED: "Chờ duyệt",
  DRAFT: "Nháp",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  PUBLISHED: "Đã xuất bản",
  SCHEDULED: "Đã lên lịch",
  LIVE: "Đang diễn ra",
  ENDED: "Đã kết thúc",
};

const StaffAuctionModeration = () => {
  const [activeTab, setActiveTab] = useState("proposals");
  const [proposals, setProposals] = useState([]);
  const [proposalLoading, setProposalLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // { proposal }
  const [rejectReason, setRejectReason] = useState("");

  const [auctions, setAuctions] = useState([]);
  const [flagLoading, setFlagLoading] = useState(true);

  // Load proposals chờ duyệt
  useEffect(() => {
    if (activeTab !== "proposals") return;
    setProposalLoading(true);
    getAuctionProposals({ scope: "staff", pageSize: 100 })
      .then((res) => {
        setProposals(res?.items || []);
        setProposalLoading(false);
      })
      .catch(() => {
        setProposals([]);
        setProposalLoading(false);
      });
  }, [activeTab]);

  // Load phiên bị báo cáo
  useEffect(() => {
    if (activeTab !== "flagged") return;
    setFlagLoading(true);
    getFlaggedAuctions()
      .then((data) => {
        setAuctions(data);
        setFlagLoading(false);
      })
      .catch(() => {
        setAuctions([]);
        setFlagLoading(false);
      });
  }, [activeTab]);

  const handleApprove = async (proposal) => {
    setProcessingId(proposal.id);
    try {
      await approveAuctionProposal(proposal.id, {
        reasonCode: "APPROVED",
        reason: "Hồ sơ hợp lệ",
        rowVersion: proposal.rowVersion ?? null,
      });
      setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
      toast.success(`✅ Đã phê duyệt hồ sơ: ${proposal.title || proposal.productName}`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Phê duyệt thất bại!";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (proposal) => {
    setRejectReason("");
    setRejectModal(proposal);
  };

  const handleConfirmReject = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }
    setProcessingId(rejectModal.id);
    try {
      await rejectAuctionProposal(rejectModal.id, {
        reasonCode: "DOCUMENT_INVALID",
        reason: rejectReason.trim(),
        rowVersion: rejectModal.rowVersion ?? null,
      });
      setProposals((prev) => prev.filter((p) => p.id !== rejectModal.id));
      toast.success(`❌ Đã từ chối hồ sơ: ${rejectModal.title || rejectModal.productName}`);
      setRejectModal(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Từ chối thất bại!";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFlagAction = async (auctionId, action) => {
    await resolveAuctionFlag(auctionId, action, "Đã xử lý bởi staff");
    setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
    toast.success(action === "approve" ? "Đã giữ phiên đấu giá" : "Đã tạm dừng phiên đấu giá");
  };

  return (
    <div className="stf-auctions">
      <StaffPageHeader
        kicker="Kiểm duyệt"
        title="Quản lý đấu giá"
        subtitle="Duyệt hồ sơ đề xuất từ Seller và xử lý các phiên bị báo cáo."
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #e0e0e0", paddingBottom: "0" }}>
        {[
          { id: "proposals", label: "🗂 Duyệt hồ sơ đề xuất" },
          { id: "flagged", label: "⚠️ Phiên bị báo cáo" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: activeTab === t.id ? "3px solid #6c63ff" : "3px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: activeTab === t.id ? 700 : 400,
              color: activeTab === t.id ? "#6c63ff" : "#555",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Duyệt hồ sơ đề xuất */}
      {activeTab === "proposals" && (
        proposalLoading ? (
          <p className="stf-auctions__empty">Đang tải hồ sơ đề xuất...</p>
        ) : proposals.length === 0 ? (
          <p className="stf-auctions__empty">Không có hồ sơ nào đang chờ duyệt.</p>
        ) : (
          <div className="stf-auctions__table-wrap">
            <table className="stf-auctions__table">
              <thead>
                <tr>
                  <th>Mã hồ sơ</th>
                  <th>Sản phẩm</th>
                  <th>Người bán</th>
                  <th>Giá khởi điểm</th>
                  <th>Bước giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id}>
                    <td><strong>#{String(p.id).slice(0, 8)}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.title || p.productName || "Sản phẩm đấu giá"}</div>
                      <small style={{ color: "#888" }}>{p.categoryName || "Danh mục"}</small>
                    </td>
                    <td>{p.sellerName || p.sellerUserId || "Người bán"}</td>
                    <td>{p.startingPrice ? `${Number(p.startingPrice).toLocaleString("vi-VN")}đ` : "---"}</td>
                    <td>{p.bidIncrement ? `${Number(p.bidIncrement).toLocaleString("vi-VN")}đ` : "---"}</td>
                    <td>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: (p.status || "").includes("APPROVED") ? "#e6f9f0" : "#fff8e1",
                        color: (p.status || "").includes("APPROVED") ? "#1a7f4b" : "#b45309",
                      }}>
                        {PROPOSAL_STATUS_LABEL[(p.status || "").toUpperCase()] || p.status || "Chờ duyệt"}
                      </span>
                    </td>
                    <td className="stf-auctions__actions">
                      <button
                        type="button"
                        disabled={processingId === p.id}
                        onClick={() => handleOpenReject(p)}
                        style={{ marginRight: "8px" }}
                      >
                        {processingId === p.id ? "..." : "Từ chối"}
                      </button>
                      <button
                        type="button"
                        className="keep"
                        disabled={processingId === p.id}
                        onClick={() => handleApprove(p)}
                      >
                        {processingId === p.id ? "Đang xử lý..." : "✅ Phê duyệt"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Tab: Phiên bị báo cáo */}
      {activeTab === "flagged" && (
        flagLoading ? (
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
                      <button type="button" onClick={() => handleFlagAction(auction.id, "suspend")}>
                        Tạm dừng
                      </button>
                      <button type="button" className="keep" onClick={() => handleFlagAction(auction.id, "approve")}>
                        Giữ phiên
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal từ chối */}
      {rejectModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setRejectModal(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "420px", maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>Từ chối hồ sơ đề xuất</h3>
            <p style={{ margin: "0 0 16px", color: "#555", fontSize: "14px" }}>
              Hồ sơ: <strong>{rejectModal.title || rejectModal.productName}</strong>
            </p>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
              Lý do từ chối <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối hồ sơ đề xuất..."
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer" }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={processingId === rejectModal.id}
                style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#d32f2f", color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                {processingId === rejectModal.id ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAuctionModeration;
