import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import AddressPage from '../../../components/profile/address';
import '../ordersPage/index.scss';

export default function AddressRoutePage() {
  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout>
          <AddressPage />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
