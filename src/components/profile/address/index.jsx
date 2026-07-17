import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import * as addressService from '../../../services/addressService';
import { getApiErrorMessage } from '../../../utils/apiResponse';
import Button from '../../common/button';
import Modal from '../../common/modal';
import AddressList from './addressList';
import AddressForm from './addressForm';
import './index.scss';

export default function AddressPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await addressService.getAddresses(user.id);
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (addr) => {
    setEditTarget(addr);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editTarget) {
        const updated = await addressService.updateAddress(user.id, editTarget.id, formData);
        setAddresses(updated);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        const updated = await addressService.addAddress(user.id, formData);
        setAddresses(updated);
        toast.success('Thêm địa chỉ thành công');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, editTarget ? 'Cập nhật địa chỉ thất bại' : 'Thêm địa chỉ thất bại')
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    try {
      const updated = await addressService.deleteAddress(user.id, id);
      setAddresses(updated);
      toast.success('Đã xóa địa chỉ');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa địa chỉ thất bại'));
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const updated = await addressService.setDefaultAddress(user.id, id);
      setAddresses(updated);
      toast.success('Đã đặt làm mặc định');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đặt địa chỉ mặc định thất bại'));
    }
  };

  const modalFooter = (
    <>
      <button type="button" className="address-page__back" onClick={() => setModalOpen(false)}>
        Trở Lại
      </button>
      <Button variant="accent" onClick={() => document.querySelector('.address-form__submit')?.click()}>
        Hoàn thành
      </Button>
    </>
  );

  return (
    <div className="address-page">
      <header className="address-page__header">
        <h1>Địa chỉ của tôi</h1>
        <Button variant="outline" className="common-btn--sm" onClick={openCreate}>
          + Thêm địa chỉ
        </Button>
      </header>

      <hr className="address-page__divider" />

      {loading && <p className="address-page__loading">Đang tải...</p>}

      {!loading && addresses.length === 0 && (
        <div className="address-page__empty">
          <span className="address-page__empty-icon" aria-hidden="true">📍</span>
          <p>Bạn chưa có địa chỉ.</p>
        </div>
      )}

      {!loading && addresses.length > 0 && (
        <AddressList
          addresses={addresses}
          onEdit={openEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Sửa địa chỉ' : 'Địa chỉ mới'}
        footer={modalFooter}
      >
        <AddressForm mode={editTarget ? 'edit' : 'create'} initial={editTarget} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
