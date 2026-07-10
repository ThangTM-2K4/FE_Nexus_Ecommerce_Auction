import { useEffect, useState } from "react";
import Modal from "../../common/modal";
import "./index.scss";

const OTHER = "__other__";

export default function RejectReasonModal({
  open,
  title = "Từ chối hồ sơ",
  subtitle,
  targetLabel,
  reasons = [],
  processing = false,
  onClose,
  onConfirm,
}) {
  const [selected, setSelected] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [note, setNote] = useState("");

  // Reset mỗi lần mở modal
  useEffect(() => {
    if (open) {
      setSelected("");
      setCustomReason("");
      setNote("");
    }
  }, [open]);

  const isOther = selected === OTHER;
  const reason = isOther ? customReason.trim() : selected;
  const canSubmit = Boolean(reason) && !processing;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm(reason, note.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="reject-reason-modal"
      footer={
        <>
          <button
            type="button"
            className="reject-reason-modal__btn reject-reason-modal__btn--ghost"
            onClick={onClose}
            disabled={processing}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="reject-reason-modal__btn reject-reason-modal__btn--danger"
            onClick={handleConfirm}
            disabled={!canSubmit}
          >
            {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </>
      }
    >
      {subtitle && <p className="reject-reason-modal__subtitle">{subtitle}</p>}
      {targetLabel && (
        <p className="reject-reason-modal__target">
          Đối tượng: <strong>{targetLabel}</strong>
        </p>
      )}

      <div className="reject-reason-modal__reasons">
        <span className="reject-reason-modal__label">Chọn lý do từ chối</span>
        {reasons.map((r) => (
          <label key={r} className="reject-reason-modal__option">
            <input
              type="radio"
              name="reject-reason"
              value={r}
              checked={selected === r}
              onChange={() => setSelected(r)}
            />
            <span>{r}</span>
          </label>
        ))}
        <label className="reject-reason-modal__option">
          <input
            type="radio"
            name="reject-reason"
            value={OTHER}
            checked={isOther}
            onChange={() => setSelected(OTHER)}
          />
          <span>Lý do khác</span>
        </label>

        {isOther && (
          <input
            type="text"
            className="reject-reason-modal__custom"
            placeholder="Nhập lý do từ chối cụ thể"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}
      </div>

      <div className="reject-reason-modal__note">
        <span className="reject-reason-modal__label">Ghi chú thêm cho người dùng (tuỳ chọn)</span>
        <textarea
          rows={3}
          placeholder="VD: Vui lòng chụp lại ảnh CCCD đủ ánh sáng và không bị che khuất."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}
