import { useLocation, useSearchParams } from 'react-router-dom';
import ErrorPage from '../../../components/errorPage';
import animation401 from '../../../assets/lottie/401.json';
import { Illustration401 } from '../../../components/errorPage/illustrations';
import './index.scss';

export default function Error401Page() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo =
    location.state?.redirectTo || searchParams.get('from') || '/';

  return (
    <ErrorPage
      className="error-page--401"
      code="401"
      tagline="Authorization required"
      title="Ơ khoan, bạn chưa đăng nhập!"
      description="Bạn cần đăng nhập để truy cập trang này. Vui lòng đăng nhập hoặc quay về trang chủ."
      animationData={animation401}
      illustration={<Illustration401 />}
      actions={[
        {
          label: 'Đăng Nhập Ngay',
          to: '/login',
          variant: 'accent',
          state: { redirectTo },
        },
        {
          label: 'Quay Về Trang Chủ',
          to: '/',
          variant: 'outline',
        },
      ]}
    />
  );
}
