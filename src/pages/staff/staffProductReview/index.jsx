import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import RejectReasonModal from "../../../components/staff/rejectReasonModal";
import { productRejectReasons } from "../../../data/staffMockData";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from "../../../services/staffService";
import "./index.scss";

const StaffProductReview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getPendingProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleApprove = async (product) => {
    setProcessingId(product.id);
    try {
      await approveProduct(product.userId, product.id);
      toast.success("Đã duyệt sản phẩm");
      await loadProducts();
    } catch (err) {
      toast.error(err.message || "Không thể duyệt sản phẩm");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (reason, note) => {
    if (!rejectTarget) return;
    const fullReason = note ? `${reason} — ${note}` : reason;
    setProcessingId(rejectTarget.id);
    try {
      await rejectProduct(rejectTarget.userId, rejectTarget.id, fullReason);
      toast.info("Đã từ chối sản phẩm");
      setRejectTarget(null);
      await loadProducts();
    } catch (err) {
      toast.error(err.message || "Không thể từ chối sản phẩm");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="stf-product-review">
      <StaffPageHeader
        kicker="Duyệt sản phẩm"
        title="Sản phẩm chờ duyệt"
        subtitle="Kiểm tra sản phẩm người bán vừa tạo và phê duyệt hoặc từ chối trước khi hiển thị công khai."
      />

      {loading ? (
        <p className="stf-product-review__empty">Đang tải danh sách...</p>
      ) : products.length === 0 ? (
        <p className="stf-product-review__empty">Không có sản phẩm nào chờ duyệt.</p>
      ) : (
        <div className="stf-product-review__list">
          {products.map((p) => (
            <article key={p.id} className="stf-product-review__card">
              <header>
                <div>
                  <h3>{p.name || "Sản phẩm chưa đặt tên"}</h3>
                  <p>{p.category} · Người bán: {p.userId}</p>
                </div>
                <span className="stf-product-review__status">{p.status}</span>
              </header>

              <dl>
                <div>
                  <dt>Giá bán</dt>
                  <dd>{Number(p.price || 0).toLocaleString("vi-VN")}đ</dd>
                </div>
                <div>
                  <dt>Tồn kho</dt>
                  <dd>{p.stock}</dd>
                </div>
                <div>
                  <dt>Số ảnh</dt>
                  <dd>{p.images?.length || 0}</dd>
                </div>
                <div>
                  <dt>Ngày tạo</dt>
                  <dd>{p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "—"}</dd>
                </div>
              </dl>

              {p.description && (
                <div className="stf-product-review__desc">
                  <strong>Mô tả:</strong>
                  <p>{p.description}</p>
                </div>
              )}

              <footer>
                <button
                  type="button"
                  className="reject"
                  disabled={processingId === p.id}
                  onClick={() => setRejectTarget(p)}
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  className="approve"
                  disabled={processingId === p.id}
                  onClick={() => handleApprove(p)}
                >
                  {processingId === p.id ? "Đang xử lý..." : "Phê duyệt"}
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      <RejectReasonModal
        open={Boolean(rejectTarget)}
        title="Từ chối sản phẩm"
        subtitle="Chọn lý do từ chối. Người bán sẽ thấy lý do này để chỉnh sửa và đăng lại."
        targetLabel={rejectTarget ? rejectTarget.name || "Sản phẩm chưa đặt tên" : ""}
        reasons={productRejectReasons}
        processing={processingId === rejectTarget?.id}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};

export default StaffProductReview;
