import ErrorPage from '../../../components/errorPage';
import animation503 from '../../../assets/lottie/503.json';
import { Illustration503 } from '../../../components/errorPage/illustrations';
import './index.scss';

export default function Error503Page() {
  return (
    <ErrorPage
      className="error-page--503"
      code="503"
      showCode={false}
      tagline="Service unavailable"
      title="Hệ thống đang bảo trì"
      description="Dịch vụ tạm thời không khả dụng, quay lại sau nha."
      animationData={animation503}
      illustration={<Illustration503 />}
    />
  );
}
