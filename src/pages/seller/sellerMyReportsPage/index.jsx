import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaWallet,
  FaChartLine,
  FaBullseye,
  FaBox,
  FaShoppingCart,
  FaTruck,
  FaFileExport,
  FaPrint,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import {
  reportCatalog,
  printedShippingLabels,
  marketingReport,
  sellerOrders,
  walletStats,
  revenueSummary,
  productStats,
  formatCurrency,
} from "../../../data/sellerMockData";
import { statusLabel } from "../../../utils/sellerOrderStatus";
import { exportCsv, todayStamp } from "../../../utils/exportCsv";

const ICONS = {
  wallet: FaWallet,
  chart: FaChartLine,
  target: FaBullseye,
  box: FaBox,
  cart: FaShoppingCart,
  truck: FaTruck,
};

export default function MyReportsPage() {
  const navigate = useNavigate();
  const labelsRef = useRef(null);
  const marketingRef = useRef(null);
  // Báo cáo đang được xem trước (null = đóng modal).
  const [preview, setPreview] = useState(null);

  const exportOrders = () => {
    const headers = ["Mã đơn", "Khách hàng", "Sản phẩm", "Giá trị", "Trạng thái", "Thời gian"];
    const rows = sellerOrders.map((o) => [o.id, o.customer, o.product, o.amount, statusLabel(o.status), o.date]);
    exportCsv(`bao-cao-don-hang-${todayStamp()}.csv`, headers, rows);
    toast.success(`Đã xuất ${sellerOrders.length} đơn hàng`);
  };

  const exportBalance = () => {
    const headers = ["Chỉ số", "Số tiền"];
    const rows = [
      ["Số dư khả dụng", walletStats.availableBalance],
      ["Số dư đang chờ", walletStats.pendingBalance],
      ["Đã rút", walletStats.withdrawnAmount],
    ];
    exportCsv(`bao-cao-so-du-${todayStamp()}.csv`, headers, rows);
    toast.success("Đã xuất báo cáo số dư");
  };

  const exportMarketing = () => {
    const headers = ["Chiến dịch", "Tiếp cận", "Lượt click", "Đơn", "Chi phí", "Doanh thu", "ROAS"];
    const rows = marketingReport.campaigns.map((c) => [
      c.name, c.reach, c.clicks, c.orders, c.spend, c.revenue, (c.revenue / c.spend).toFixed(1),
    ]);
    exportCsv(`bao-cao-marketing-${todayStamp()}.csv`, headers, rows);
    toast.success("Đã xuất báo cáo marketing");
  };

  // Hành động thật sự chạy khi bấm nút xác nhận trong modal xem trước.
  const reportAction = (id) => {
    switch (id) {
      case "balance": return { label: "Xuất báo cáo", icon: FaFileExport, onClick: exportBalance };
      case "income": return { label: "Xem thu nhập", onClick: () => navigate("/seller-hub/revenue") };
      case "marketing": return { label: "Xem chi tiết", onClick: () => marketingRef.current?.scrollIntoView({ behavior: "smooth" }) };
      case "sales": return { label: "Phân tích bán hàng", onClick: () => navigate("/seller-hub/performance") };
      case "orders-export": return { label: "Xuất CSV", icon: FaFileExport, onClick: exportOrders };
      case "shipping-labels": return { label: "Xem phiếu gửi", onClick: () => labelsRef.current?.scrollIntoView({ behavior: "smooth" }) };
      default: return { label: "Xem", onClick: () => {} };
    }
  };

  // Nội dung bảng xem trước cho từng loại báo cáo.
  const previewContent = (id) => {
    switch (id) {
      case "balance":
        return {
          headers: ["Chỉ số", "Số tiền"],
          rows: [
            ["Số dư khả dụng", formatCurrency(walletStats.availableBalance)],
            ["Số dư đang chờ", formatCurrency(walletStats.pendingBalance)],
            ["Đã rút", formatCurrency(walletStats.withdrawnAmount)],
          ],
        };
      case "income":
        return {
          headers: ["Chỉ số", "Giá trị"],
          rows: [
            ["Doanh thu gộp", formatCurrency(revenueSummary.grossRevenue)],
            ["Doanh thu ròng", formatCurrency(revenueSummary.netRevenue)],
            ["Phí sàn", formatCurrency(revenueSummary.commissionFee)],
            ["Hoàn tiền", formatCurrency(revenueSummary.refundAmount)],
            ["Lợi nhuận ròng", formatCurrency(revenueSummary.profit)],
          ],
        };
      case "marketing":
        return {
          headers: ["Chiến dịch", "Doanh thu", "ROAS"],
          rows: marketingReport.campaigns.map((c) => [
            c.name, formatCurrency(c.revenue), `${(c.revenue / c.spend).toFixed(1)}x`,
          ]),
        };
      case "sales":
        return {
          headers: ["Chỉ số", "Giá trị"],
          rows: [
            ["Tổng sản phẩm", productStats.total],
            ["Đang bán", productStats.active],
            ["Hết hàng", productStats.outOfStock],
            ["Bị khóa", productStats.locked],
            ["Chờ duyệt", productStats.pending],
          ],
        };
      case "orders-export":
        return {
          note: `Xem trước 4 / ${sellerOrders.length} đơn — bấm nút bên dưới để xuất toàn bộ ra CSV.`,
          headers: ["Mã đơn", "Khách hàng", "Giá trị"],
          rows: sellerOrders.slice(0, 4).map((o) => [o.id, o.customer, formatCurrency(o.amount)]),
        };
      case "shipping-labels":
        return {
          headers: ["Mã phiếu", "Đơn hàng", "Đơn vị VC"],
          rows: printedShippingLabels.map((l) => [l.id, l.order, l.carrier]),
        };
      default:
        return { headers: [], rows: [] };
    }
  };

  const closePreview = () => setPreview(null);

  // Bấm nút xác nhận trong modal → chạy hành động thật rồi đóng modal.
  const confirmPreview = () => {
    if (preview) reportAction(preview.id).onClick();
    closePreview();
  };

  const reprint = (id) => toast.info(`Đang gửi phiếu ${id} tới máy in...`);
  const download = () => {
    const headers = ["Mã phiếu", "Đơn hàng", "Đơn vị VC", "Thời gian in", "Số trang"];
    const rows = printedShippingLabels.map((l) => [l.id, l.order, l.carrier, l.printedAt, l.pages]);
    exportCsv(`phieu-gui-hang-${todayStamp()}.csv`, headers, rows);
    toast.success("Đã tải danh sách phiếu gửi hàng");
  };

  const previewData = preview ? previewContent(preview.id) : null;
  const previewAction = preview ? reportAction(preview.id) : null;
  const ConfirmIcon = previewAction?.icon;

  return (
    <div className="slr-page">
      <PageHeader
        title="Báo Cáo Của Tôi"
        subtitle="Toàn bộ báo cáo hoạt động của Shop được thống kê tại đây."
      />

      <section className="slr-section">
        <div className="slr-report-grid">
          {reportCatalog.map((r) => {
            const Icon = ICONS[r.icon] ?? FaChartLine;
            return (
              <div key={r.id} className="slr-report-card">
                <div className="slr-report-card__icon"><Icon /></div>
                <div className="slr-report-card__info">
                  <h4>{r.name}</h4>
                  <p>{r.desc}</p>
                  <span className="slr-report-card__period">{r.period}</span>
                </div>
                <button type="button" className="slr-btn slr-btn--ghost slr-report-card__action" onClick={() => setPreview(r)}>
                  Xem trước <FaArrowRight />
                </button>
              </div>
            );
          })}
        </div>

        <div className="slr-panel-card" ref={marketingRef}>
          <h4>Báo cáo marketing</h4>
          <div className="slr-table-wrap">
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th>Chiến dịch</th>
                  <th>Tiếp cận</th>
                  <th>Lượt click</th>
                  <th>Đơn</th>
                  <th>Chi phí</th>
                  <th>Doanh thu</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {marketingReport.campaigns.map((c) => (
                  <tr key={c.name}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.reach.toLocaleString("vi-VN")}</td>
                    <td>{c.clicks.toLocaleString("vi-VN")}</td>
                    <td>{c.orders}</td>
                    <td>{formatCurrency(c.spend)}</td>
                    <td>{formatCurrency(c.revenue)}</td>
                    <td className="pos"><strong>{(c.revenue / c.spend).toFixed(1)}x</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="slr-toolbar__actions" style={{ marginTop: 12 }}>
            <button type="button" className="slr-btn slr-btn--primary" onClick={exportMarketing}>
              <FaFileExport /> Xuất báo cáo marketing
            </button>
          </div>
        </div>

        <div className="slr-panel-card" ref={labelsRef}>
          <div className="slr-toolbar">
            <h4 style={{ margin: 0 }}>Phiếu gửi hàng đã in</h4>
            <div className="slr-toolbar__actions">
              <button type="button" className="slr-btn slr-btn--ghost" onClick={download}>Tải danh sách</button>
            </div>
          </div>
          <div className="slr-table-wrap">
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Đơn hàng</th>
                  <th>Đơn vị VC</th>
                  <th>Thời gian in</th>
                  <th>Số trang</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {printedShippingLabels.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.id}</strong></td>
                    <td>{l.order}</td>
                    <td>{l.carrier}</td>
                    <td className="muted">{l.printedAt}</td>
                    <td>{l.pages}</td>
                    <td>
                      <button type="button" className="slr-btn-plain" onClick={() => reprint(l.id)}>
                        <FaPrint /> In lại
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {preview && previewData && (
        <div className="slr-modal-overlay" onClick={closePreview}>
          <div className="slr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="slr-modal__head">
              <div>
                <h4>Xem trước · {preview.name}</h4>
                <p>{preview.desc}</p>
              </div>
              <button type="button" className="slr-modal__close" onClick={closePreview} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>

            <div className="slr-modal__body">
              {previewData.note && <p className="slr-modal__note">{previewData.note}</p>}
              <div className="slr-table-wrap">
                <table className="slr-table slr-table--compact">
                  <thead>
                    <tr>
                      {previewData.headers.map((h) => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{j === 0 ? <strong>{cell}</strong> : cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="slr-modal__foot">
              <button type="button" className="slr-btn slr-btn--ghost" onClick={closePreview}>
                Đóng
              </button>
              <button type="button" className="slr-btn slr-btn--primary" onClick={confirmPreview}>
                {ConfirmIcon && <ConfirmIcon />}
                {previewAction.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
