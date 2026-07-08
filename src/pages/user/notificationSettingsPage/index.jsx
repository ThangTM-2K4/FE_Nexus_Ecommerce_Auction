import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import NotificationSettingsPage from '../../../components/profile/notificationSettings';
import '../ordersPage/index.scss';

export default function NotificationSettingsRoutePage() {
  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout>
          <NotificationSettingsPage />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
