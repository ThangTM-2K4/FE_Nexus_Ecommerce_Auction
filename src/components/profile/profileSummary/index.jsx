import { useAuth } from '../../../context/AuthContext';
import UserAvatar from '../../common/userAvatar';
import TrustRankBar from '../trustRankBar';
import './index.scss';

export default function ProfileSummary({ profile, sellerStatus }) {
  const { user } = useAuth();

  return (
    <section className="account-profile-summary" id="profile">
      <div className="account-profile-summary__identity">
        <UserAvatar
          avatar={user?.avatar}
          name={user?.fullName}
          className="account-profile-summary__avatar"
        />
        <div>
          <h2>{user?.fullName}</h2>
          <p>{user?.email}</p>
        </div>
      </div>
      <TrustRankBar profile={profile} sellerStatus={sellerStatus} />
    </section>
  );
}
