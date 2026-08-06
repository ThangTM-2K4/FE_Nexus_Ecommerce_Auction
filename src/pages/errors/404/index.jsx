import ErrorPage from '../../../components/errorPage';
import animation404 from '../../../assets/lottie/404.json';
import { Illustration404 } from '../../../components/errorPage/illustrations';
import './index.scss';

export default function Error404Page() {
  return (
    <ErrorPage
      className="error-page--404"
      code="404"
      tagline="Page not found"
      title="Trang này đi lạc mất rồi 🐱"
      description="Có vẻ trang bạn tìm không tồn tại hoặc đã bị xoá. Vui lòng quay về trang chủ."
      animationData={animation404}
      illustration={<Illustration404 />}
      actions={[
        {
          label: 'Quay Về Trang Chủ',
          to: '/',
          variant: 'accent',
        },
      ]}
    />
  );
}
