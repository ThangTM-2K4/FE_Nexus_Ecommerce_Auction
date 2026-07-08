import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import BankAccountPage from '../../../components/profile/bankAccount';
import '../ordersPage/index.scss';

export default function BankAccountRoutePage() {
  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout>
          <BankAccountPage />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
