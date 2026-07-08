import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import EmptyState from '../../../components/profile/emptyState';
import '../ordersPage/index.scss';

export default function VouchersPage() {
  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout title="Kho Voucher" description="Quản lý mã giảm giá của bạn">
          <EmptyState icon="🎟️" title="Chưa có voucher" description="Săn voucher tại trang khuyến mãi nhé!" />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
