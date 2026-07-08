import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import PrivacySettings from '../../../components/profile/privacySettings';
import '../ordersPage/index.scss';

export default function PrivacySettingsRoutePage() {
  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout>
          <PrivacySettings />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
