import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as profileService from '../../../services/profileService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import ProfileInfo from '../../../components/profile/profileInfo';
import BuyerTrustScore from '../../../components/profile/buyerTrustScore';
import '../ordersPage/index.scss';
import './index.scss';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    profileService.getProfile(user.id).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user?.id]);

  // Cuộn tới mục "Xác minh tài khoản" khi vào /profile#verification
  useEffect(() => {
    if (loading) return;
    if (window.location.hash === '#verification') {
      document.getElementById('verification')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading]);

  const handleProfileUpdate = (updated) => {
    setProfile(updated);
    refreshUser();
  };

  if (loading) {
    return (
      <div className="account-page">
        <Header />
        <main className="account-page__main">
          <p className="account-page__loading">Đang tải hồ sơ...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout title="Hồ Sơ" description="Quản lý thông tin tài khoản của bạn">
          <div className="profile-layout">
            <ProfileInfo userId={user.id} profile={profile} onUpdate={handleProfileUpdate} />
            <BuyerTrustScore profile={profile} />
          </div>
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
