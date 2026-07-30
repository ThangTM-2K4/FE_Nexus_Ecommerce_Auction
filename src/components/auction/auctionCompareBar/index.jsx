import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaBalanceScale, FaTimes, FaTrash, FaGavel, FaCheck } from "react-icons/fa";
import { getCompareList, removeCompareItem, clearCompareList } from "../../../utils/compareAuction";
import AuctionImage from "../auctionImage";
import AuctionCountdown from "../auctionCountdown";
import "./index.scss";

export default function AuctionCompareBar() {
  const [compareList, setCompareList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadList = useCallback(() => {
    setCompareList(getCompareList());
  }, []);

  useEffect(() => {
    loadList();
    const onStorage = (e) => {
      if (!e.key || e.key === "auc_compare_list") {
        loadList();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadList]);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* ─── Floating Bottom Compare Bar ─── */}
      <div className="auc-compare-bar">
        <div className="auc-compare-bar__info">
          <div className="auc-compare-bar__badge">
            <FaBalanceScale />
            <span>So Sánh ({compareList.length}/3)</span>
          </div>
          <div className="auc-compare-bar__items">
            {compareList.map((item) => (
              <div key={item.id} className="compare-item-thumb">
                <img src={item.image} alt={item.title} />
                <span className="title">{item.title}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeCompareItem(item.id)}
                  title="Gỡ sản phẩm"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="auc-compare-bar__actions">
          <button
            type="button"
            className="btn-clear"
            onClick={clearCompareList}
            title="Xoá toàn bộ so sánh"
          >
            <FaTrash /> Xoá tất cả
          </button>
          <button
            type="button"
            className="btn-compare-now"
            onClick={() => setIsModalOpen(true)}
          >
            <FaBalanceScale /> So Sánh Ngay ({compareList.length})
          </button>
        </div>
      </div>

      {/* ─── Compare Drawer / Modal ─── */}
      {isModalOpen && (
        <div className="auc-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="auc-modal auc-modal--compare" onClick={(e) => e.stopPropagation()}>
            <div className="auc-modal__header">
              <h3>
                <FaBalanceScale style={{ color: "#e8c468" }} />
                So Sánh Chi Tiết Sản Phẩm Đấu Giá
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="auc-modal__body">
              <div className="compare-table-wrapper">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th className="feature-col">THÔNG TIN</th>
                      {compareList.map((item) => (
                        <th key={item.id} className="product-col">
                          <div className="compare-product-header">
                            <button
                              type="button"
                              className="btn-remove-col"
                              onClick={() => removeCompareItem(item.id)}
                              title="Gỡ khỏi so sánh"
                            >
                              <FaTimes /> Gỡ
                            </button>
                            <div className="img-wrap">
                              <AuctionImage src={item.image} alt={item.title} />
                            </div>
                            <strong>{item.title}</strong>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="feature-label">Giá hiện tại</td>
                      {compareList.map((item) => (
                        <td key={item.id} className="price-cell">
                          <strong>{item.currentPrice || item.currentBid}</strong>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="feature-label">Thời gian còn lại</td>
                      {compareList.map((item) => (
                        <td key={item.id}>
                          <AuctionCountdown endTime={item.endTime} />
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="feature-label">Danh mục</td>
                      {compareList.map((item) => (
                        <td key={item.id}>
                          <span className="cat-badge">{item.categoryLabel}</span>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="feature-label">Vị trí</td>
                      {compareList.map((item) => (
                        <td key={item.id}>{item.location}</td>
                      ))}
                    </tr>

                    <tr>
                      <td className="feature-label">Loại tin đăng</td>
                      {compareList.map((item) => (
                        <td key={item.id}>{item.listingType}</td>
                      ))}
                    </tr>

                    <tr>
                      <td className="feature-label">Người bán</td>
                      {compareList.map((item) => (
                        <td key={item.id}>{item.seller}</td>
                      ))}
                    </tr>

                    <tr>
                      <td className="feature-label">Mô tả sản phẩm</td>
                      {compareList.map((item) => (
                        <td key={item.id} className="desc-cell">
                          {item.description || "Chưa có thông tin mô tả chi tiết."}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="feature-label">Thao tác</td>
                      {compareList.map((item) => (
                        <td key={item.id}>
                          <button
                            type="button"
                            className="btn-action-bid"
                            onClick={() => {
                              setIsModalOpen(false);
                              navigate(`/auction/detail/${item.id}`);
                            }}
                          >
                            <FaGavel /> Đặt giá ngay
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="auc-modal__footer">
              <button
                type="button"
                className="btn-close-won-modal"
                onClick={() => setIsModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
