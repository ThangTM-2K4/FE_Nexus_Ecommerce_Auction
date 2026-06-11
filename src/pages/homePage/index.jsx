import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header';
import Footer from '../../components/footer';
import './index.scss';

const HOME_BANNERS = [
	{
		id: 1,
		title: 'Deal săn ngay hôm nay',
		subtitle: 'Ưu đãi hot cho điện tử, thời trang và phụ kiện',
		image:
			'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
	},
	{
		id: 2,
		title: 'Bộ sưu tập mùa mới',
		subtitle: 'Hàng chọn lọc cho phong cách sống hiện đại',
		image:
			'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80',
	},
	{
		id: 3,
		title: 'Khám phá công nghệ',
		subtitle: 'Thiết bị mới, giá tốt, sẵn sàng đặt mua',
		image:
			'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
	},
	{
		id: 4,
		title: 'Nhà đẹp, đồ xịn',
		subtitle: 'Nâng cấp không gian sống chỉ với vài cú nhấp',
		image:
			'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
	},
];

const HOME_PRODUCTS = [
	{
		id: 1,
		name: 'Tai nghe Bluetooth Pro X2',
		price: 1290000,
		oldPrice: 1590000,
		bids: 24,
		time: '02:14:08',
		badge: 'Bán chạy',
		image:
			'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 2,
		name: 'Đồng hồ thông minh Urban Fit',
		price: 1890000,
		oldPrice: 2290000,
		bids: 16,
		time: '01:42:19',
		badge: 'Mới về',
		image:
			'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 3,
		name: 'Balo laptop đa năng 15.6"',
		price: 690000,
		oldPrice: 890000,
		bids: 9,
		time: '04:08:30',
		badge: 'Giảm giá',
		image:
			'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 4,
		name: 'Máy ảnh mirrorless Alpha S',
		price: 14500000,
		oldPrice: 16900000,
		bids: 7,
		time: '05:22:44',
		badge: 'Hot deal',
		image:
			'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 5,
		name: 'Giày sneaker runner pulse',
		price: 980000,
		oldPrice: 1280000,
		bids: 19,
		time: '00:51:12',
		badge: 'Săn ngay',
		image:
			'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 6,
		name: 'Loa mini karaoke party',
		price: 1590000,
		oldPrice: 1890000,
		bids: 12,
		time: '03:09:55',
		badge: 'Đề xuất',
		image:
			'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 7,
		name: 'Áo khoác denim premium',
		price: 790000,
		oldPrice: 990000,
		bids: 15,
		time: '01:12:03',
		badge: 'Thịnh hành',
		image:
			'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 8,
		name: 'Bàn phím cơ RGB compact',
		price: 1190000,
		oldPrice: 1390000,
		bids: 21,
		time: '02:41:39',
		badge: 'Gaming',
		image:
			'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 9,
		name: 'Nước hoa unisex signature',
		price: 870000,
		oldPrice: 1090000,
		bids: 8,
		time: '06:10:44',
		badge: 'Limited',
		image:
			'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 10,
		name: 'Ghế công thái học mesh',
		price: 2490000,
		oldPrice: 2890000,
		bids: 18,
		time: '03:55:18',
		badge: 'Best choice',
		image:
			'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 11,
		name: 'Cốc giữ nhiệt inox 500ml',
		price: 290000,
		oldPrice: 390000,
		bids: 13,
		time: '00:34:57',
		badge: 'Tiện ích',
		image:
			'https://pos.nvncdn.com/cba2a3-7534/ps/20250823_goXdSXR6Nc.jpeg?v=1755918838',
	},
	{
		id: 12,
		name: 'Túi tote canvas tối giản',
		price: 360000,
		oldPrice: 490000,
		bids: 6,
		time: '01:28:11',
		badge: 'Eco',
		image:
			'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 13,
		name: 'Máy xay cầm tay đa năng',
		price: 540000,
		oldPrice: 690000,
		bids: 10,
		time: '02:08:45',
		badge: 'Gia dụng',
		image:
			'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 14,
		name: 'Ánh sáng bàn làm việc LED',
		price: 430000,
		oldPrice: 590000,
		bids: 11,
		time: '04:19:26',
		badge: 'Desk setup',
		image:
			'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
	},
	{
		id: 15,
		name: 'Ốp lưng điện thoại chống sốc',
		price: 180000,
		oldPrice: 250000,
		bids: 5,
		time: '00:58:39',
		badge: 'Phụ kiện',
		image:
			'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=80',
	},
];

const FEATURED_DEAL = {
	name: 'iPhone 16 Pro 256GB',
	category: 'Công nghệ · Chính hãng VN/A',
	bids: 47,
	price: 1240000,
	oldPrice: 28990000,
	progress: 72,
	time: '00:14:32',
	viewers: 3,
};

const MINI_DEALS = [
	{ id: 1, icon: 'laptop', tag: 'Kết thúc lúc 20:00', name: 'MacBook Air M3' },
	{ id: 2, icon: 'shirt', tag: 'Flash deal - 72%', name: 'Áo Hè Routine' },
	{ id: 3, icon: 'glasses', tag: 'Còn 2 suất bid', name: 'Kính Gương UV400' },
	{ id: 4, icon: 'home', tag: 'Gia dụng hot', name: 'Robot hút bụi' },
];

const HERO_STATS = [
	{ value: '50k+', label: 'Người mua tin dùng' },
	{ value: '15+', label: 'Sản phẩm mới mỗi ngày' },
	{ value: '4 phiên', label: 'Đấu giá live mỗi tuần' },
];

const HERO_FEATURES = [
	{
		icon: 'clock',
		title: 'Đấu giá theo thời gian thực',
		description:
			'Mỗi lượt bid cập nhật tức thì. Không delay, không bỏ lỡ cơ hội chỉ vì kết nối chậm.',
	},
	{
		icon: 'shield',
		title: 'Bảo vệ người mua 100%',
		description:
			'Hàng không đúng mô tả — hoàn tiền toàn bộ. Giao dịch an tâm, không lo rủi ro.',
	},
	{
		icon: 'percent',
		title: 'Giá thấp hơn thị trường',
		description:
			'Nhiều deal thắng với giá thấp hơn 70-90% giá niêm yết. Không phải may mắn — là chiến lược.',
	},
];

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value);

const MiniDealIcon = ({ type }) => {
	const icons = {
		laptop: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<rect x="3" y="5" width="18" height="12" rx="2" />
				<path d="M2 19h20" />
			</svg>
		),
		shirt: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M16 3l4 4-2 2v12H6V9L4 7l4-4 4 2 4-2z" />
			</svg>
		),
		glasses: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="7" cy="14" r="3" />
				<circle cx="17" cy="14" r="3" />
				<path d="M10 14h4M4 14H2M22 14h-2" />
			</svg>
		),
		home: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
			</svg>
		),
	};

	return icons[type] ?? icons.laptop;
};

const FeatureIcon = ({ type }) => {
	const icons = {
		clock: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="12" cy="12" r="9" />
				<path d="M12 7v5l3 2" />
			</svg>
		),
		shield: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
			</svg>
		),
		percent: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<circle cx="7" cy="7" r="2.5" />
				<circle cx="17" cy="17" r="2.5" />
				<path d="M19 5L5 19" />
			</svg>
		),
	};

	return icons[type] ?? icons.clock;
};

const loadMockProducts = () =>
	new Promise((resolve) => {
		globalThis.setTimeout(() => resolve(HOME_PRODUCTS), 320);
	});

export default function HomePageContent() {
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const fetchProducts = async () => {
			setIsLoading(true);
			const data = await loadMockProducts();

			if (mounted) {
				setProducts(data);
				setIsLoading(false);
			}
		};

		fetchProducts();

		return () => {
			mounted = false;
		};
	}, []);

	return (
		<>
			<Header />
			<div className="home-page-content">
				<section className="home-hero" id="featured">
				<div className="home-hero-top">
					<div className="home-hero-copy">
						<span className="home-hero-kicker">
							Marketplace đấu giá &amp; mua sắm thông minh
						</span>
						<h1>
							<span className="home-hero-title-main">Bid thật, giá thật —</span>
							<span className="home-hero-title-accent">Deal biến mất trong vài phút.</span>
						</h1>
						<p>
							Hàng nghìn sản phẩm công nghệ, thời trang, gia dụng được đấu giá mỗi ngày. Ai nhanh
							tay, người đó thắng.
						</p>

						<div className="home-hero-actions">
							<a href="#products" className="home-hero-btn home-hero-btn--outline">
								Xem deal đang diễn ra →
							</a>
							<Link to="/login" className="home-hero-btn home-hero-btn--ghost">
								Đăng nhập
							</Link>
						</div>
					</div>

					<aside className="home-hero-deals" aria-label="Deal đang diễn ra">
						<div className="home-deals-header">
							<div className="home-deals-title-wrap">
								<span className="home-deals-live-tag">Live</span>
								<h2>Deal đang diễn ra</h2>
							</div>
							<span className="home-live-badge">
								<span className="home-live-dot" aria-hidden="true" />
								<strong>{FEATURED_DEAL.viewers}</strong>
								<span>người đang xem</span>
							</span>
						</div>

						<article className="home-featured-deal">
							<span className="home-featured-deal-hot" aria-hidden="true">
								🔥 Deal hot
							</span>
							<div className="home-featured-deal-main">
								<div className="home-featured-deal-info">
									<h3 className="home-featured-deal-name">{FEATURED_DEAL.name}</h3>
									<p className="home-featured-deal-meta">{FEATURED_DEAL.category}</p>
									<span className="home-featured-deal-bids">
										{FEATURED_DEAL.bids} lượt bid
									</span>
								</div>
								<div className="home-featured-deal-price">
									<span className="home-featured-deal-discount">
										-
										{Math.round(
											((FEATURED_DEAL.oldPrice - FEATURED_DEAL.price) /
												FEATURED_DEAL.oldPrice) *
												100,
										)}
										%
									</span>
									<strong>{formatCurrency(FEATURED_DEAL.price)}đ</strong>
									<span className="home-featured-deal-price-label">Giá hiện tại</span>
									<small>Giá gốc: {formatCurrency(FEATURED_DEAL.oldPrice)}đ</small>
								</div>
							</div>

							<div
								className="home-featured-deal-progress"
								role="progressbar"
								aria-valuenow={FEATURED_DEAL.progress}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label="Tiến độ đấu giá"
							>
								<span style={{ width: `${FEATURED_DEAL.progress}%` }} />
							</div>

							<div className="home-featured-deal-footer">
								<div className="home-countdown" aria-label="Thời gian còn lại">
									{FEATURED_DEAL.time.split(':').map((part, index, arr) => (
										<span key={part + index}>
											<em>{part}</em>
											{index < arr.length - 1 && <i aria-hidden="true">:</i>}
										</span>
									))}
								</div>
								<button type="button" className="home-bid-btn btn-cta-effect">
									<span>Bid ngay</span>
								</button>
							</div>
						</article>

						<div className="home-mini-deals-grid">
							{MINI_DEALS.map((deal) => (
								<article key={deal.id} className="home-mini-deal">
									<span className="home-mini-deal-icon">
										<MiniDealIcon type={deal.icon} />
									</span>
									<div>
										<p>{deal.tag}</p>
										<strong>{deal.name}</strong>
									</div>
								</article>
							))}
						</div>
					</aside>
				</div>

				<div className="home-hero-stats" aria-label="Thống kê nền tảng">
					{HERO_STATS.map((stat, index) => (
						<div key={stat.label} className="home-hero-stat">
							<strong>{stat.value}</strong>
							<span>{stat.label}</span>
							{index < HERO_STATS.length - 1 && (
								<span className="home-hero-stat-divider" aria-hidden="true" />
							)}
						</div>
					))}
				</div>

				<div className="home-hero-features">
					{HERO_FEATURES.map((feature) => (
						<article key={feature.title} className="home-feature-card">
							<span className="home-feature-icon">
								<FeatureIcon type={feature.icon} />
							</span>
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</article>
					))}
				</div>
			</section>

			<section className="home-banner-section" id="banners">
				<div className="home-section-heading">
					<div>
						<span className="home-section-kicker">Banner nổi bật</span>
						<h2>4 khối banner để đẩy campaign và sản phẩm chủ lực</h2>
					</div>
					<p>Thiết kế dạng grid để dễ thay ảnh thật hoặc map từ CMS sau này.</p>
				</div>

				<div className="home-banner-grid">
					{HOME_BANNERS.map((banner) => (
						<article key={banner.id} className="home-banner-card">
							<img src={banner.image} alt={banner.title} loading="lazy" />
							<div className="home-banner-overlay">
								<span>0{banner.id}</span>
								<h3>{banner.title}</h3>
								<p>{banner.subtitle}</p>
							</div>
						</article>
					))}
				</div>
			</section>

			<section className="home-products-section" id="products">
				<div className="home-section-heading">
					<div>
						<span className="home-section-kicker">Sản phẩm mới</span>
						<h2>Danh sách mock 15 sản phẩm để test layout bán hàng</h2>
					</div>
					<p>
						Khi backend sẵn sàng, chỉ thay phần mock bằng fetch API thật và giữ nguyên phần render.
					</p>
				</div>

				{isLoading ? (
					<div className="home-loading-state">Đang tải sản phẩm...</div>
				) : (
					<div className="home-products-grid">
						{products.map((product) => (
							<article key={product.id} className="home-product-card">
								<div className="home-product-image-wrap">
									<img src={product.image} alt={product.name} loading="lazy" />
									<span className="home-product-badge">{product.badge}</span>
								</div>

								<div className="home-product-body">
									<h3>{product.name}</h3>
									<div className="home-product-prices">
										<strong>{formatCurrency(product.price)}đ</strong>
										<span>{formatCurrency(product.oldPrice)}đ</span>
									</div>

									<div className="home-product-meta">
										<span>{product.bids} lượt bid</span>
										<span>Còn {product.time}</span>
									</div>

									<button type="button" className="home-product-action">
										Đặt giá ngay
									</button>
								</div>
							</article>
						))}
					</div>
				)}
			</section>
		</div>
		<Footer />
	</>
);
}
