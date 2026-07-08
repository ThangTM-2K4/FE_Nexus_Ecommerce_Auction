import { useAuth } from '../../../context/AuthContext';
import TrustRankBar from '../trustRankBar';
import './index.scss';

export default function ProfileSummary({ profile, sellerStatus }) {
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <section className="account-profile-summary" id="profile">
      <div className="account-profile-summary__identity">
        <span className="account-profile-summary__avatar">{initials}</span>
        <div>
          <h2>{user?.fullName}</h2>
          <p>{user?.email}</p>
        </div>
      </div>
      <TrustRankBar profile={profile} sellerStatus={sellerStatus} />
    </section>
  );
}
