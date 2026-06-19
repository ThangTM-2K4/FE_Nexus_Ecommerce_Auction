import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as profileService from '../../../services/profileService';
import * as sellerService from '../../../services/sellerService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import PersonalInfoSection from '../../../components/user/profile/PersonalInfoSection';
import VerificationSection from '../../../components/user/profile/VerificationSection';
import BankAccountSection from '../../../components/user/profile/BankAccountSection';
import ActivityHistorySection from '../../../components/user/profile/ActivityHistorySection';
import BecomeSellerSection from '../../../components/user/profile/BecomeSellerSection';
import ReputationOverviewSection from '../../../components/user/profile/ReputationOverviewSection';
import './index.scss';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [profileData, appData] = await Promise.all([
        profileService.getProfile(user.id),
        sellerService.getSellerApplication(user.id),
      ]);
      setProfile(profileData);
      setApplication(appData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleProfileUpdate = (updated) => {
    setProfile(updated);
    refreshUser();
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <main className="profile-main">
          <p className="profile-loading">Đang tải hồ sơ...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <div className="profile-hero">
          <h1>Hồ sơ của tôi</h1>
          <p>Quản lý thông tin cá nhân, xác minh tài khoản và lịch sử hoạt động</p>
        </div>

        <div className="profile-layout">
          <ReputationOverviewSection
            profile={profile}
            sellerStatus={user.sellerStatus}
          />
          <PersonalInfoSection
            userId={user.id}
            profile={profile}
            onUpdate={handleProfileUpdate}
          />
          <VerificationSection
            userId={user.id}
            profile={profile}
            onUpdate={handleProfileUpdate}
          />
          <BankAccountSection
            userId={user.id}
            profile={profile}
            onUpdate={handleProfileUpdate}
          />
          <BecomeSellerSection profile={profile} application={application} />
          <ActivityHistorySection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
