import { useState } from "react";
import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";
import "./index.scss";

function SellerCreateAuction() {
  const [images, setImages] = useState([]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);

    const preview = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages(preview);
  };

  return (
    <>
      <SellerSidebar />

      <div className="seller-page">
        <SellerHeader />

        <div className="create-auction">
          <h2>Tạo Phiên Đấu Giá</h2>

          <form className="auction-form">
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                rows="5"
                placeholder="Mô tả chi tiết sản phẩm"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá khởi điểm</label>
                <input type="number" />
              </div>

              <div className="form-group">
                <label>Bước giá</label>
                <input type="number" />
              </div>
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input type="datetime-local" />
            </div>

            <div className="form-group">
              <label>Hình ảnh sản phẩm</label>

              <input
                type="file"
                multiple
                onChange={handleUpload}
              />

              <div className="image-preview">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt=""
                  />
                ))}
              </div>
            </div>

            <button className="submit-btn">
              Tạo phiên đấu giá
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SellerCreateAuction;