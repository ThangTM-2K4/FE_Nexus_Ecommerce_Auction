import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as profileService from '../../../services/profileService';
import Header from '../../../components/homepage/header';
import Footer from '../../../components/homepage/footer';
import AccountLayout from '../../../components/profile/accountLayout';
import PersonalInfoCccd from '../../../components/profile/personalInfo';
import '../ordersPage/index.scss';

export default function PersonalInfoRoutePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    profileService.getProfile(user.id).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user?.id]);

  if (loading) {
    return (
      <div className="account-page">
        <Header />
        <main className="account-page__main">
          <p className="account-page__loading">Đang tải...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="account-page">
      <Header />
      <main className="account-page__main">
        <AccountLayout>
          <PersonalInfoCccd
            userId={user.id}
            profile={profile}
            onUpdate={(updated) => {
              setProfile(updated);
              refreshUser();
            }}
          />
        </AccountLayout>
      </main>
      <Footer />
    </div>
  );
}
