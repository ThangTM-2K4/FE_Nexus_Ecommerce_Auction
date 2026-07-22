import './index.scss';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function UserAvatar({
  avatar,
  name,
  className = '',
  loading = false,
  alt = '',
}) {
  const initials = getInitials(name);

  return (
    <span
      className={`user-avatar ${loading ? 'user-avatar--loading' : ''} ${className}`.trim()}
      aria-hidden={alt ? undefined : true}
    >
      {avatar ? (
        <img className="user-avatar__img" src={avatar} alt={alt || 'Ảnh đại diện'} />
      ) : (
        <span className="user-avatar__initials">{initials}</span>
      )}

      {loading && (
        <span className="user-avatar__overlay" aria-hidden="true">
          <span className="user-avatar__spinner" />
        </span>
      )}
    </span>
  );
}
