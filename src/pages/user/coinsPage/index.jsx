import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import EmptyState from '../../../components/profile/emptyState';
import '../ordersPage/index.scss';

export default function CoinsPage() {
  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout title="Shopee Xu" description="Xu tích lũy và đổi ưu đãi">
          <EmptyState icon="🪙" title="Chưa có Shopee Xu" description="Mua sắm và tham gia đấu giá để tích Xu." />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
