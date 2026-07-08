import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { useAuth } from "../../../context/AuthContext";
import * as shopService from "../../../services/shopService";
import * as productService from "../../../services/productService";
import "./index.scss";

export default function MediaLibraryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      shopService.getShopProfile(user.id, user),
      productService.getMyProducts(user.id),
    ]).then(([profile, products]) => {
      const media = [];

      if (profile.logo) {
        media.push({ id: "shop-logo", src: profile.logo, usedIn: "Logo Shop" });
      }
      if (profile.cover) {
        media.push({ id: "shop-cover", src: profile.cover, usedIn: "Ảnh bìa Shop" });
      }

      products.forEach((p) => {
        (p.images || []).forEach((src, i) => {
          media.push({ id: `${p.id}-${i}`, src, usedIn: `Sản phẩm: ${p.name || p.id}` });
        });
      });

      setItems(media);
      setLoading(false);
    });
  }, [user?.id, user]);

  return (
    <div className="slr-page">
      <PageHeader
        title="Kho Hình Ảnh/Video"
        subtitle="Toàn bộ ảnh đã tải lên cho Shop và sản phẩm"
      />

      <section className="slr-section">
        <div className="slr-panel-card">
          <h4>Ảnh đã tải lên ({items.length})</h4>
          {loading ? (
            <p>Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="slr-shop-profile__value">
              Chưa có ảnh nào. Tải logo/ảnh bìa tại{" "}
              <Link to="/seller-hub/shop-profile">Hồ Sơ Shop</Link>, hoặc thêm ảnh khi{" "}
              <Link to="/seller-hub/products/create">tạo sản phẩm</Link>.
            </p>
          ) : (
            <div className="slr-media-library__grid">
              {items.map((m) => (
                <div key={m.id} className="slr-media-library__item">
                  <img src={m.src} alt={m.usedIn} />
                  <span>{m.usedIn}</span>
                </div>
              ))}
            </div>
          )}
          <p className="slr-wallet-note">
            Tải logo và ảnh bìa mới tại <Link to="/seller-hub/shop-profile">Hồ Sơ Shop</Link>, hoặc thêm ảnh
            sản phẩm mới tại <Link to="/seller-hub/products/create">Tạo sản phẩm</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
