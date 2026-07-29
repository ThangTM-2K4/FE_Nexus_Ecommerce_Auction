import ErrorPage from '../../../components/errorPage';
import animation403 from '../../../assets/lottie/403.json';
import { Illustration403 } from '../../../components/errorPage/illustrations';
import './index.scss';

export default function Error403Page() {
  return (
    <ErrorPage
      className="error-page--403"
      code="403"
      tagline="Forbidden"
      title="Khu vực cấm địa!"
      description="Bạn không có quyền vào khu vực này đâu, quay lại thôi."
      animationData={animation403}
      illustration={<Illustration403 />}
    />
  );
}
