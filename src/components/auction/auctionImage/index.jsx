import { useState, useEffect } from "react";
import { auctionImages } from "../../../data/auctionImages";
import "./index.scss";

const AuctionImage = ({
  src,
  alt = "",
  className = "",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={`auc-image ${className}`.trim()}
      loading="lazy"
      onError={() => {
        if (imgSrc !== auctionImages.fallback) {
          setImgSrc(auctionImages.fallback);
        }
      }}
    />
  );
};

export default AuctionImage;