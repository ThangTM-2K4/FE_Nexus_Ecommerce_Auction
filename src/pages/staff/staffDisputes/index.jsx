import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { getOpenDisputes, updateDisputeStatus } from "../../../services/staffService";
import "./index.scss";

const StaffDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOpenDisputes().then((data) => {
      setDisputes(data);
      setLoading(false);
    });
  }, []);

  const handleResolve = async (disputeId) => {
    await updateDisputeStatus(disputeId, "Đã giải quyết", "Staff đã xử lý khiếu nại");
    setDisputes((prev) => prev.filter((d) => d.id !== disputeId));
    toast.success("Đã đánh dấu khiếu nại là đã giải quyết");
  };

  return (
    <div className="stf-disputes">
      <StaffPageHeader
        kicker="Hỗ trợ khách hàng"
        title="Khiếu nại & tranh chấp"
        subtitle="Theo dõi SLA, liên hệ hai bên và ghi nhận kết quả xử lý."
      />

      {loading ? (
        <p className="stf-disputes__empty">Đang tải...</p>
      ) : (
        <div className="stf-disputes__grid">
          {disputes.map((dispute) => (
            <article key={dispute.id} className="stf-disputes__card">
              <header>
                <div>
                  <h3>{dispute.id}</h3>
                  <p>Đơn hàng {dispute.orderId}</p>
                </div>
                <span className={dispute.sla === "Quá hạn" ? "overdue" : "sla"}>
                  SLA: {dispute.sla}
                </span>
              </header>

              <p className="stf-disputes__issue">{dispute.issue}</p>

              <dl>
                <div>
                  <dt>Người mua</dt>
                  <dd>{dispute.buyer}</dd>
                </div>
                <div>
                  <dt>Người bán</dt>
                  <dd>{dispute.seller}</dd>
                </div>
                <div>
                  <dt>Giá trị</dt>
                  <dd>{dispute.amount}</dd>
                </div>
                <div>
                  <dt>Trạng thái</dt>
                  <dd>{dispute.status}</dd>
                </div>
              </dl>

              <footer>
                <small>Mở lúc {dispute.openedAt}</small>
                <button type="button" onClick={() => handleResolve(dispute.id)}>
                  Đánh dấu đã giải quyết
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDisputes;
