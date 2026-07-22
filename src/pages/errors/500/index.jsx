import ErrorPage from '../../../components/errorPage';
import animation500 from '../../../assets/lottie/500.json';
import { Illustration500 } from '../../../components/errorPage/illustrations';
import './index.scss';

export default function Error500Page() {
  return (
    <ErrorPage
      className="error-page--500"
      layout="light"
      code="500"
      showCode={false}
      tagline="Internal server error"
      title="Ối, server bị vấp té rồi!"
      description="Đội kỹ thuật đang xử lý, bạn thử lại sau ít phút nhé."
      animationData={animation500}
      illustration={<Illustration500 />}
      actions={[
        { label: 'Thử Lại', onClick: () => window.location.reload(), variant: 'accent' },
        { label: 'Về Trang Chủ', to: '/', variant: 'outline' },
      ]}
    />
  );
}
