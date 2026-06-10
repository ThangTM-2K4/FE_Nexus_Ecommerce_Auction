import './index.scss';
import Header from '../../components/header';
import Footer from '../../components/footer';

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main className="home-main">
        {/* Home page content */}
      </main>
      <Footer />
    </div>
  );
}
