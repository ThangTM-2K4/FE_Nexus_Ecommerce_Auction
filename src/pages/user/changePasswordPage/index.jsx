import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import ChangePassword from '../../../components/profile/changePassword';
import '../ordersPage/index.scss';

export default function ChangePasswordRoutePage() {
  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout>
          <ChangePassword />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
