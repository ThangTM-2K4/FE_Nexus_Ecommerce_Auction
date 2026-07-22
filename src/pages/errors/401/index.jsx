import ErrorPage from '../../../components/errorPage';
import animation401 from '../../../assets/lottie/401.json';
import { Illustration401 } from '../../../components/errorPage/illustrations';
import './index.scss';

export default function Error401Page() {
  return (
    <ErrorPage
      className="error-page--401"
      code="401"
      tagline="Authorization required"
      title="Ơ khoan, bạn đăng nhập chưa vậy?"
      description="Bạn cần đăng nhập để xem trang này đó nha."
      animationData={animation401}
      illustration={<Illustration401 />}
      actions={[{ label: 'Đăng Nhập Ngay', to: '/login', variant: 'accent' }]}
    />
  );
}
