import { useState } from 'react';
import Button from '../../common/button';
import Modal from '../../common/modal';
import './index.scss';

// TODO: Nối API yêu cầu xóa tài khoản khi BE cung cấp endpoint
const requestAccountDeletion = async () => {
  // await api.post('/users/me/deletion-request');
};

export default function PrivacySettings() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await requestAccountDeletion();
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const modalFooter = (
    <>
      <Button variant="ghost" onClick={() => setModalOpen(false)}>
        Hủy
      </Button>
      <Button variant="accent" onClick={handleConfirm} disabled={submitting}>
        {submitting ? 'Đang xử lý...' : 'Xác nhận'}
      </Button>
    </>
  );

  return (
    <section className="privacy-settings">
      <h1 className="privacy-settings__title">Những thiết lập riêng tư</h1>
      <hr className="privacy-settings__divider" />

      <div className="privacy-settings__row">
        <span className="privacy-settings__label">Yêu cầu xóa tài khoản</span>
        <Button variant="accent" className="common-btn--sm" onClick={() => setModalOpen(true)}>
          Xóa bỏ
        </Button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Xác nhận xóa tài khoản"
        footer={modalFooter}
      >
        <p className="privacy-settings__modal-text">
          Bạn có chắc chắn muốn yêu cầu xóa tài khoản? Hành động này có thể không hoàn tác sau khi
          được xử lý.
        </p>
      </Modal>
    </section>
  );
}
