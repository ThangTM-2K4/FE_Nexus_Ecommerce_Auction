const [images, setImages] = useState([]);

const handleImageChange = (e) => {
  const files = Array.from(
    e.target.files
  );

  setImages(files);
};

<div className="form-group">
  <label>Hình ảnh sản phẩm</label>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageChange}
  />

  <div className="preview-images">
    {images.map((img, index) => (
      <img
        key={index}
        src={URL.createObjectURL(img)}
        alt=""
      />
    ))}
  </div>
</div>