import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FaStore, FaStar, FaChevronRight, FaFilter, FaSearch, FaMapMarkerAlt, FaShippingFast } from "react-icons/fa";
import Header from "../../components/homepage/header";
import Footer from "../../components/homepage/footer";
import { searchSellers, searchProducts } from "../../services/searchService";
import { resolveImageUrl } from "../../services/ecommerceProductService";
import "./index.scss";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryKeyword = searchParams.get("keyword") || searchParams.get("search") || searchParams.get("q") || "";

  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState("relevant"); // relevant, newest, sales, price_asc, price_desc
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: null, max: null });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [sellerRes, productRes] = await Promise.all([
          searchSellers(queryKeyword),
          searchProducts(queryKeyword, 1, 40),
        ]);

        if (isMounted) {
          setSellers(sellerRes?.items || []);
          const rawProds = productRes?.items || [];
          setProducts(rawProds);
        }
      } catch (err) {
        console.warn("Search load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [queryKeyword]);

  // Apply Client-Side Filters & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter Location
    if (selectedLocations.length > 0) {
      result = result.filter((p) => {
        const loc = String(p.originCountry || p.address || p.sellerLocation || "").toLowerCase();
        return selectedLocations.some((l) => loc.includes(l.toLowerCase()));
      });
    }

    // Filter Category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        const cat = String(p.category || p.categoryName || p.categoryId || "").toLowerCase();
        return selectedCategories.some((c) => cat.includes(c.toLowerCase()));
      });
    }

    // Filter Price Range
    if (priceFilter.min != null && priceFilter.min > 0) {
      result = result.filter((p) => Number(p.price || p.minPrice || 0) >= priceFilter.min);
    }
    if (priceFilter.max != null && priceFilter.max > 0) {
      result = result.filter((p) => Number(p.price || p.minPrice || 0) <= priceFilter.max);
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return result;
  }, [products, selectedLocations, selectedCategories, priceFilter, sortBy]);

  const handleApplyPrice = (e) => {
    e.preventDefault();
    setPriceFilter({
      min: minPrice ? Number(minPrice) : null,
      max: maxPrice ? Number(maxPrice) : null,
    });
  };

  const toggleLocation = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((item) => item !== loc) : [...prev, loc]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  return (
    <>
      <Header />
      <div className="search-page-container">
        <div className="search-page-shell">
          {/* SHOP LIÊN QUAN SECTION (Shopee-style) */}
          {sellers.length > 0 && queryKeyword && (
            <section className="search-seller-section">
              <div className="search-seller-header">
                <span className="search-seller-title">
                  SHOP LIÊN QUAN ĐẾN &quot;<strong>{queryKeyword.toUpperCase()}</strong>&quot;
                </span>
                <span className="search-seller-more">
                  Thêm Kết Quả <FaChevronRight size={10} />
                </span>
              </div>

              <div className="search-seller-grid">
                {sellers.map((seller) => {
                  const sId = seller.sellerId || seller.userId || seller.id;
                  const name = seller.businessName || seller.name || "Shop Uy Tín";
                  const address = seller.address || "Việt Nam";
                  return (
                    <div key={sId} className="search-seller-card">
                      <div className="search-seller-card__left">
                        <div className="search-seller-avatar">
                          <FaStore size={24} color="#fff" />
                        </div>
                        <div className="search-seller-info">
                          <h4 className="search-seller-name">{name}</h4>
                          <p className="search-seller-sub">{address}</p>
                          <div className="search-seller-tags">
                            <span className="seller-tag-mall">Mall</span>
                            <span className="seller-tag-verified">Đã xác minh</span>
                          </div>
                        </div>
                      </div>

                      <div className="search-seller-card__right">
                        <div className="seller-stat-item">
                          <span className="stat-val">9+</span>
                          <span className="stat-lbl">Sản Phẩm</span>
                        </div>
                        <div className="seller-stat-item">
                          <span className="stat-val">4.9 ⭐</span>
                          <span className="stat-lbl">Đánh Giá</span>
                        </div>
                        <div className="seller-stat-item">
                          <span className="stat-val">98%</span>
                          <span className="stat-lbl">Phản Hồi</span>
                        </div>
                        <button
                          type="button"
                          className="btn-visit-shop"
                          onClick={() => navigate(`/shop/${sId}`)}
                        >
                          Xem Shop
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* MAIN SEARCH CONTENT SECTION */}
          <div className="search-main-layout">
            {/* FILTER SIDEBAR LEFT */}
            <aside className="search-sidebar">
              <div className="sidebar-heading">
                <FaFilter /> BỘ LỌC TÌM KIẾM
              </div>

              {/* Nơi Bán */}
              <div className="filter-group">
                <h5 className="filter-title">Nơi Bán</h5>
                {["Thành phố Hà Nội", "Thành phố Hồ Chí Minh", "Tỉnh Bắc Ninh", "Tỉnh Cao Bằng"].map((loc) => (
                  <label key={loc} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                    />
                    <span>{loc}</span>
                  </label>
                ))}
              </div>

              {/* Theo Danh Mục */}
              <div className="filter-group">
                <h5 className="filter-title">Theo Danh Mục</h5>
                {["Áo thun", "Thời Trang Trẻ Em", "Nhà Sách Online", "Thời Trang Nam", "Đồ Điện Tử"].map((cat) => (
                  <label key={cat} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>

              {/* Khoảng Giá */}
              <div className="filter-group">
                <h5 className="filter-title">Khoảng Giá</h5>
                <form onSubmit={handleApplyPrice} className="price-range-form">
                  <input
                    type="number"
                    placeholder="₫ TỪ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="₫ ĐẾN"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                  <button type="submit" className="btn-apply-price">ÁP DỤNG</button>
                </form>
              </div>
            </aside>

            {/* PRODUCT RESULTS RIGHT */}
            <main className="search-results-area">
              <div className="search-result-title-bar">
                <span>
                  Kết quả tìm kiếm cho từ khoá &apos;<strong>{queryKeyword}</strong>&apos;
                </span>
              </div>

              {/* SORTING CONTROLS BAR */}
              <div className="search-sort-bar">
                <span className="sort-label">Sắp xếp theo</span>
                <button
                  type="button"
                  className={`sort-btn ${sortBy === "relevant" ? "active" : ""}`}
                  onClick={() => setSortBy("relevant")}
                >
                  Liên Quan
                </button>
                <button
                  type="button"
                  className={`sort-btn ${sortBy === "newest" ? "active" : ""}`}
                  onClick={() => setSortBy("newest")}
                >
                  Mới Nhất
                </button>

                <select
                  className="sort-select"
                  value={sortBy.startsWith("price_") ? sortBy : ""}
                  onChange={(e) => setSortBy(e.target.value || "relevant")}
                >
                  <option value="">Giá</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              {/* PRODUCT GRID */}
              {loading ? (
                <div className="search-loading-state">
                  <p>Đang tìm kiếm sản phẩm và shop...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="search-empty-state">
                  <FaSearch size={48} color="#ccc" />
                  <h3>Không tìm thấy sản phẩm nào phù hợp</h3>
                  <p>Hãy thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc</p>
                </div>
              ) : (
                <div className="search-product-grid">
                  {filteredProducts.map((prod) => {
                    const pId = prod.id || prod.productId;
                    const imgSrc = resolveImageUrl(prod.images?.[0] || prod.imageUrl || prod.primaryImageUrl);
                    const price = Number(prod.price || prod.minPrice || 0);

                    return (
                      <div
                        key={pId}
                        className="search-product-card"
                        onClick={() => navigate(`/product/${pId}`)}
                      >
                        <div className="prod-card-thumb-wrap">
                          {imgSrc ? (
                            <img src={imgSrc} alt={prod.name} className="prod-card-thumb" />
                          ) : (
                            <div className="prod-card-no-img">📦</div>
                          )}
                          <span className="prod-card-badge-mall">Mall</span>
                        </div>

                        <div className="prod-card-body">
                          <h4 className="prod-card-title" title={prod.name}>
                            {prod.name || prod.productName}
                          </h4>
                          <div className="prod-card-price-row">
                            <span className="prod-card-price">
                              {price.toLocaleString("vi-VN")}₫
                            </span>
                            <span className="prod-card-discount">-10%</span>
                          </div>
                          <div className="prod-card-footer">
                            <span className="prod-card-rating"><FaStar color="#ffce3d" size={11} /> 4.9</span>
                            <span className="prod-card-sold">Đã bán 1.2k</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
