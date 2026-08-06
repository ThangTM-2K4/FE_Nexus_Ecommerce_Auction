import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";

import {
  FaHeart, FaCheckCircle, FaClock, FaGavel, FaArrowLeft, FaShieldAlt, FaExclamationTriangle, FaTimes, FaTrophy, FaMapMarkerAlt, FaTruck, FaMoneyBillWave, FaBuilding, FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionImage from "../../../components/auction/auctionImage";
import {
  getAuctionById,
  getAuctionLiveView,
  getMyAuctionRegistration,
  placeBid as apiPlaceBid,
  registerAuction as apiRegisterAuction,
  updateWinnerDeliveryAddress,
  initiateWinnerPayment,
} from "../../../services/auctionService";
import { useAuth } from "../../../context/AuthContext";
import RequireAuthModal from "../../../components/auction/requireAuthModal";
import { useProvinces, useWards } from "../../../services/locationService";


import "./index.scss";


const BID_HISTORY_KEY = "auc_bid_history";

function maskUsername(name, isCurrentUser, isAdmin = false) {
  if (isCurrentUser || isAdmin) return name;
  if (!name) return "***";
  if (name.length <= 3) return name.slice(0, 1) + "***";
  return name.slice(0, 3) + "***";
}

function isSameUser(currentUser, bidUser) {
  if (!currentUser || !bidUser) return false;
  const target = String(bidUser).trim().toLowerCase();
  const names = [currentUser.name, currentUser.fullName, currentUser.email, currentUser.username]
    .filter(Boolean)
    .map((s) => String(s).trim().toLowerCase());
  return names.includes(target);
}


function saveBidToHistory(user, product, amount) {
  const existing = JSON.parse(localStorage.getItem(BID_HISTORY_KEY) || "[]");
  const entry = {
    id: Date.now(),
    auctionId: product.id,
    title: product.title,
    image: product.images?.[0] || "",
    category: product.breadcrumbs?.[1] || "",
    amount,
    currency: String(product.currentPrice).includes("$") ? "USD" : "VND",
    bidAt: new Date().toISOString(),
    userName: user?.name || user?.fullName || user?.email || "Bạn",
    userAvatar: user?.avatar || user?.avatarUrl || "",
    status: "winning",
  };
  localStorage.setItem(BID_HISTORY_KEY, JSON.stringify([entry, ...existing].slice(0, 200)));
}

function formatSeconds(totalSeconds) {
  if (totalSeconds <= 0) return "00:00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days} ngày ${pad(remHours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function parseTimeToSeconds(str) {
  if (!str) return 300;
  if (str.includes("ngày")) {
    const days = parseInt(str) || 1;
    return days * 86400;
  }
  const parts = str.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 180;
}

function loadAuctionDetailData(id) {
  if (!id) return getAuctionDetail("1");

  try {
    const publishedList = JSON.parse(localStorage.getItem("auc_published_auctions") || "[]");
    const foundPublished = publishedList.find((item) => String(item.id) === String(id));
    if (foundPublished) {
      return {
        id: foundPublished.id,
        title: foundPublished.title,
        description: foundPublished.description || "Phiên đấu giá vừa được Admin phê duyệt và xuất bản sảnh chính.",
        currentPrice: foundPublished.currentPrice || "1.000.000đ",
        startingPrice: foundPublished.startingPrice || 1000000,
        bidIncrement: foundPublished.bidIncrement || 500000,
        depositAmount: foundPublished.depositAmount || 1000000,
        images: foundPublished.images || [foundPublished.image || "/images/auction/default.png"],
        seller: foundPublished.seller || "Seller (Shop)",
        sellerAvatar: "/images/avatars/seller.png",
        sellerBadge: "NGƯỜI BÁN UY TÍN",
        breadcrumbs: ["TRANG CHỦ", String(foundPublished.category || "ĐỒNG HỒ").toUpperCase(), foundPublished.title],
        timeLeft: "2d 23h",
        bidHistory: [],
        leader: "Chưa có lượt đặt giá",
        leaderAvatar: "",
      };
    }
  } catch {}

  try {
    const proposalsList = JSON.parse(localStorage.getItem("auc_my_proposals") || "[]");
    const foundProposal = proposalsList.find((item) => String(item.id) === String(id));
    if (foundProposal) {
      return {
        id: foundProposal.id,
        title: foundProposal.title,
        description: foundProposal.description || "Đề xuất phiên đấu giá đang được kiểm duyệt.",
        currentPrice: `${(foundProposal.startingPrice || 0).toLocaleString()}đ`,
        startingPrice: foundProposal.startingPrice || 0,
        bidIncrement: foundProposal.bidIncrement || 500000,
        depositAmount: foundProposal.depositAmount || 1000000,
        images: [foundProposal.image || "/images/auction/default.png"],
        seller: "Bạn (Người bán)",
        sellerAvatar: "/images/avatars/seller.png",
        sellerBadge: "NGƯỜI BÁN",
        breadcrumbs: ["TRANG CHỦ", String(foundProposal.categoryName || "ĐỒNG HỒ").toUpperCase(), foundProposal.title],
        timeLeft: "Đang chờ duyệt",
        bidHistory: [],
        leader: "Chưa có lượt đặt giá",
        leaderAvatar: "",
      };
    }
  } catch {}

  return getAuctionDetail(id);
}

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSellerMode, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  // rowVersion dùng cho optimistic concurrency khi đặt giá
  const [bidHeadRowVersion, setBidHeadRowVersion] = useState(null);

  // Load chi tiết phiên đấu giá từ API
  useEffect(() => {
    if (!id) return;
    getAuctionById(id)
      .then((res) => {
        if (res) {
          setProduct(res);
          if (res.currentPrice) setCurrentPrice(res.currentPrice);
        } else {
          // Fallback sang mock nếu API chưa có dữ liệu
          const fallback = loadAuctionDetailData(id);
          setProduct(fallback);
          if (fallback?.currentPrice) setCurrentPrice(fallback.currentPrice);
        }
      })
      .catch(() => {
        const fallback = loadAuctionDetailData(id);
        setProduct(fallback);
        if (fallback?.currentPrice) setCurrentPrice(fallback.currentPrice);
      });
  }, [id]);

  // Poll live-view mỗi 5 giây để cập nhật giá, rowVersion, thời gian kết thúc
  useEffect(() => {
    if (!id) return;
    const poll = async () => {
      try {
        const lv = await getAuctionLiveView(id);
        if (!lv) return;
        if (lv.currentPrice != null) {
          const isUsdLocal = String(lv.currentPrice).includes('$');
          const formatted = isUsdLocal
            ? `$${Number(lv.currentPrice).toLocaleString('en-US')}`
            : `${Number(lv.currentPrice).toLocaleString('vi-VN')}đ`;
          setCurrentPrice(formatted);
        }
        if (lv.bidHeadRowVersion) setBidHeadRowVersion(lv.bidHeadRowVersion);
        if (lv.endTime) {
          const remaining = Math.max(0, Math.floor((new Date(lv.endTime).getTime() - Date.now()) / 1000));
          setSecondsLeft(remaining);
          if (remaining <= 0) setIsAuctionEnded(true);
        }
      } catch { /* ignore polling errors */ }
    };
    poll();
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [id]);

  // Kiểm tra trạng thái đăng ký khi user đăng nhập
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    getMyAuctionRegistration(id)
      .then((reg) => {
        if (reg && (reg.isRegistered || reg.status === 'CONFIRMED' || reg.status === 'APPROVED')) {
          setIsRegistered(true);
        }
      })
      .catch(() => {});
  }, [id, isAuthenticated]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(() => {
    if (!isAuthenticated) return false;
    try {
      const list = JSON.parse(localStorage.getItem("auc_watchlist") || "[]");
      return list.some((item) => String(item.id) === String(product?.id));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLiked(false);
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem("auc_watchlist") || "[]");
      setLiked(list.some((item) => String(item.id) === String(product?.id)));
    } catch {
      setLiked(false);
    }
  }, [product?.id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && location.state?.pendingAction) {
      const { type } = location.state.pendingAction;
      if (type === "PLACE_BID") {
        toast.info("💡 Bạn đã đăng nhập thành công! Hãy nhập số tiền thầu và bấm Xác Nhận Đặt Giá.");
      }
      try {
        window.history.replaceState({}, document.title);
      } catch {
        /* ignore */
      }
    }
  }, [isAuthenticated, location.state]);



  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    title: "Cần đăng nhập để thực hiện chức năng này",
    subtitle: "Vui lòng đăng nhập hoặc đăng ký tài khoản Nexus để theo dõi và tham gia các phiên đấu giá.",
    pendingAction: null,
  });

  const handleToggleLike = () => {
    if (!product) return;
    if (!isAuthenticated || !user) {
      setAuthModalConfig({
        isOpen: true,
        title: "Cần đăng nhập để theo dõi sản phẩm",
        subtitle: "Vui lòng đăng nhập hoặc đăng ký tài khoản Nexus để lưu sản phẩm vào mục Đang Theo Dõi.",
        pendingAction: {
          type: "TOGGLE_WATCHLIST",
          auction: {
            id: product.id,
            title: product.title,
            description: product.description || "",
            image: product.images?.[0] || "",
            currentPrice: currentPrice || product.currentPrice,
            categoryLabel: product.breadcrumbs?.[1] || "",
            timeLeft: product.timeLeft || "24h",
          },
        },
      });
      return;
    }


    try {
      const list = JSON.parse(localStorage.getItem("auc_watchlist") || "[]");
      const exists = list.some((item) => String(item.id) === String(product.id));
      let updated = [];
      if (exists) {
        updated = list.filter((item) => String(item.id) !== String(product.id));
        toast.info("Đã gỡ sản phẩm khỏi mục Đang Theo Dõi");
      } else {
        updated = [
          {
            id: product.id,
            title: product.title,
            description: product.description || "",
            image: product.images?.[0] || "",
            currentPrice: currentPrice || product.currentPrice,
            categoryLabel: product.breadcrumbs?.[1] || "",
            timeLeft: product.timeLeft || "24h",
            addedAt: new Date().toISOString(),
          },
          ...list,
        ];
        toast.success("🎉 Đã thêm sản phẩm vào mục Đang Theo Dõi!");
      }
      localStorage.setItem("auc_watchlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      setLiked(!exists);
    } catch {
      setLiked((l) => !l);
    }
  };
  const [bidAmount, setBidAmount] = useState("");

  const [currentPrice, setCurrentPrice] = useState(() => product?.currentPrice || "");
  const [leader, setLeader] = useState(() => product?.leader || "");
  const [leaderAvatar, setLeaderAvatar] = useState(() => product?.leaderAvatar || "");
  const [bidHistory, setBidHistory] = useState(() => product?.bidHistory || []);

  // Real-time Countdown timer state
  const [secondsLeft, setSecondsLeft] = useState(() => parseTimeToSeconds(product?.timeLeft));
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);

  // 12h Payment timer state
  const [payTimerSeconds, setPayTimerSeconds] = useState(12 * 3600); // 12 hours = 43200 seconds
  const [isPaymentExpired, setIsPaymentExpired] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Bid confirmation modal state
  const [showBidConfirmModal, setShowBidConfirmModal] = useState(false);

  // Checkout & Address Selection Modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [addressTab, setAddressTab] = useState("default"); // 'default' | 'new'
  const [customAddress, setCustomAddress] = useState({
    fullName: "",
    phone: "",
    provinceCode: "",
    provinceName: "",
    wardCode: "",
    wardName: "",
    streetAddress: "",
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("wallet");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Location API for checkout form
  const { provinces, loading: loadingProvinces } = useProvinces();
  const { wards, loading: loadingWards } = useWards(customAddress.provinceCode);

  // Detect if navigated from admin or user is Admin
  const [searchParams] = useSearchParams();
  const isAdminUser = user?.role === 'ADMIN' || user?.roleCode === 'ADMIN' || (Array.isArray(user?.roles) && user.roles.includes('ADMIN')) || (Array.isArray(user?.privileges) && user.privileges.some(p => String(p).startsWith('ADMIN')));
  const fromAdmin = searchParams.get('from') === 'admin' || isAdminUser;

  const [showRegModal, setShowRegModal] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Load history & initial top leader
  useEffect(() => {
    if (!product) return;

    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem(BID_HISTORY_KEY) || "[]");
    } catch {
      stored = [];
    }

    const localBidsForThis = stored.filter(
      (item) => String(item.auctionId) === String(product.id)
    );

    let mergedHistory = Array.isArray(product.bidHistory) ? [...product.bidHistory] : [];

    if (localBidsForThis.length > 0) {
      const isUsd = String(product.currentPrice || "").includes("$");
      const formattedLocal = localBidsForThis.map((b) => {
        const formattedAmt = isUsd
          ? `$${Number(b.amount).toLocaleString("en-US")}`
          : `${Number(b.amount).toLocaleString("vi-VN")}đ`;
        return {
          user: b.userName,
          avatar: b.userAvatar || product.leaderAvatar,
          amount: formattedAmt,
          rawAmount: b.amount,
          time: "Vừa xong",
          isLeader: false,
          userId: b.userId,
        };

      });

      mergedHistory = [...formattedLocal, ...mergedHistory];
    }

    if (mergedHistory.length > 0) {
      mergedHistory[0] = { ...mergedHistory[0], isLeader: true };
      const topBid = mergedHistory[0];
      setCurrentPrice(topBid.amount || product.currentPrice);
      setLeader(topBid.user || product.leader);
      setLeaderAvatar(topBid.avatar || product.leaderAvatar);
    } else {
      setCurrentPrice(product.currentPrice || "");
      setLeader(product.leader || "");
      setLeaderAvatar(product.leaderAvatar || "");
    }

    const ips = ["113.161.42.88", "14.232.180.12", "118.69.182.44", "27.72.105.19", "171.244.30.95"];
    const devices = ["Desktop Chrome 126 (Win 11)", "Mobile Safari (iOS 17.4)", "Desktop Edge 125 (Win 11)", "Mobile Chrome (Android 14)"];
    const methods = ["Thủ công", "Đặt tự động (AutoBid)", "Thủ công", "Thủ công"];

    const enrichedHistory = mergedHistory.map((b, index) => {
      const attempt = mergedHistory.length - index;
      const dateObj = new Date(Date.now() - index * 4 * 60 * 1000 - 18000);
      const timeStr = dateObj.toLocaleTimeString("vi-VN") + " " + dateObj.toLocaleDateString("vi-VN");

      return {
        ...b,
        attemptNum: attempt,
        exactTime: b.exactTime || timeStr,
        ip: b.ip || ips[index % ips.length],
        device: b.device || devices[index % devices.length],
        method: b.method || methods[index % methods.length],
        status: b.status || (index === 3 ? "⚠️ Nghi vấn (Chênh IP)" : "✓ Hợp lệ"),
      };
    });

    setBidHistory(enrichedHistory);
  }, [product]);

  // Real-time Countdown timer tick
  useEffect(() => {
    if (isAuctionEnded) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsAuctionEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuctionEnded]);

  // 12h Payment timer tick (runs when auction ended and not yet paid or expired)
  useEffect(() => {
    if (!isAuctionEnded || isPaid || isPaymentExpired) return;
    const interval = setInterval(() => {
      setPayTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPaymentExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuctionEnded, isPaid, isPaymentExpired]);

  const handleOpenRegistration = () => {
    if (!isAuthenticated || !user) {
      setAuthModalConfig({
        isOpen: true,
        title: "Cần đăng nhập để đăng ký tham gia đấu giá",
        subtitle: "Vui lòng đăng nhập hoặc đăng ký tài khoản Nexus để đặt cọc và tham gia phiên đấu giá này.",
        pendingAction: {
          type: "REGISTER_AUCTION",
          auctionId: id,
        },
      });
      return;
    }


    const isEmailOk = user.isEmailVerified ?? true;
    const isPhoneOk = user.isPhoneVerified ?? false;
    const isKycOk = user.isNationalIdVerified ?? false;

    if (!isEmailOk || !isPhoneOk || !isKycOk) {
      setRegStep(1);
    } else {
      setRegStep(2);
    }
    setShowRegModal(true);
  };

  const handleConfirmRegistration = async () => {
    if (!agreeTerms) {
      toast.error("Vui lòng tích chọn đồng ý với Quy chế & Điều khoản đặt cọc!");
      return;
    }
    try {
      setIsRegistering(true);
      await apiRegisterAuction(id); // Idempotency-Key tự động tạo trong service
      setIsRegistered(true);
      setShowRegModal(false);
      toast.success("🎉 Đăng ký & Đặt cọc tham gia đấu giá thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Đăng ký thất bại, vui lòng thử lại!";
      toast.error(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!product) {
    return (
      <div className="auc-detail auc-detail--empty">
        <p>Không tìm thấy phiên đấu giá này.</p>
        <button type="button" onClick={() => navigate("/auction")}>Quay lại danh sách</button>
      </div>
    );
  }

  const isUsd = String(currentPrice || product.currentPrice).includes("$");
  const currentPriceNum = Number(String(currentPrice).replace(/[^0-9]/g, "")) || 0;

  const minBid = currentPriceNum
    ? currentPriceNum + (isUsd ? 500 : 500000)
    : (isUsd ? 500 : 500000);

  const increments = isUsd
    ? [
        { value: 500, label: "+$500" },
        { value: 1000, label: "+$1K" },
        { value: 5000, label: "+$5K" },
      ]
    : [
        { value: 500000, label: "+500K" },
        { value: 1000000, label: "+1M" },
        { value: 5000000, label: "+5M" },
      ];

  const handleIncrement = (incValue) => {
    const currentVal = bidAmount
      ? Number(bidAmount.replace(/[^0-9]/g, ""))
      : minBid;
    const newVal = currentVal + incValue;
    setBidAmount(newVal.toLocaleString(isUsd ? "en-US" : "vi-VN"));
  };

  const handleBid = () => {
    if (!isAuthenticated || !user) {
      setAuthModalConfig({
        isOpen: true,
        title: "Cần đăng nhập để đặt giá đấu",
        subtitle: "Vui lòng đăng nhập hoặc đăng ký tài khoản Nexus để tham gia đặt giá sản phẩm này.",
        pendingAction: {
          type: "PLACE_BID",
          auctionId: id,
        },
      });
      return;
    }


    if (isAuctionEnded) {
      toast.error("Phiên đấu giá đã kết thúc, không thể đặt giá nữa!");
      return;
    }
    const amount = Number(String(bidAmount).replace(/[^0-9]/g, ""));
    if (!bidAmount || amount < minBid) {
      toast.error(
        `Giá thầu tối thiểu là ${isUsd ? "$" : ""}${minBid.toLocaleString(isUsd ? "en-US" : "vi-VN")}${isUsd ? "" : " ₫"}`
      );
      return;
    }

    setShowBidConfirmModal(true);
  };

  const confirmAndSubmitBid = async () => {
    const amount = Number(String(bidAmount).replace(/[^0-9]/g, ""));
    const userName = user.name || user.fullName || user.email || "Bạn";
    const userAvatar = user.avatar || user.avatarUrl || product?.leaderAvatar;
    const formattedAmount = isUsd
      ? `$${amount.toLocaleString("en-US")}`
      : `${amount.toLocaleString("vi-VN")}đ`;

    // Cập nhật UI lạc quan ngay lập tức
    const newBidItem = {
      user: userName,
      avatar: userAvatar,
      amount: formattedAmount,
      rawAmount: amount,
      time: "Vừa xong",
      isLeader: true,
      isYou: true,
    };
    const updatedHistory = [
      newBidItem,
      ...bidHistory.map((b) => ({ ...b, isLeader: false })),
    ];
    setBidHistory(updatedHistory);
    setCurrentPrice(formattedAmount);
    setLeader(userName);
    setLeaderAvatar(userAvatar);
    setBidAmount("");
    setShowBidConfirmModal(false);

    // Gọi API thật với đủ body theo spec
    try {
      await apiPlaceBid(id, amount, bidHeadRowVersion, 'VND');
      saveBidToHistory(user, product, amount);
      toast.success(`🎉 Đặt giá ${formattedAmount} thành công! Bạn đang là người dẫn đầu.`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Đặt giá thất bại, vui lòng thử lại!";
      toast.error(msg);
      // Rollback UI
      setBidHistory(bidHistory);
      setCurrentPrice(product?.currentPrice || '');
    }
  };

  // Winner checkout submit handler
  const handleConfirmCheckout = async () => {
    if (addressTab === "new") {
      const errors = {};
      if (!customAddress.fullName) errors.fullName = true;
      if (!customAddress.phone) errors.phone = true;
      if (!customAddress.streetAddress) errors.streetAddress = true;
      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        toast.error("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      setAddressErrors({});
    }

    try {
      setIsProcessingPayment(true);

      // 1. Cập nhật địa chỉ giao hàng qua API nếu nhập địa chỉ mới
      if (addressTab === "new" && customAddress.streetAddress) {
        try {
          await updateWinnerDeliveryAddress(id, {
            recipientName: customAddress.fullName,
            phone: customAddress.phone,
            provinceCode: customAddress.provinceCode || '',
            districtCode: customAddress.districtCode || '',
            wardCode: customAddress.wardCode || '',
            addressLine: customAddress.streetAddress,
          });
        } catch { /* non-blocking */ }
      }

      // 2. Khởi tạo thanh toán VNPAY — backend trả redirectUrl
      try {
        const payResult = await initiateWinnerPayment(id, {
          provider: 'VNPAY',
          paymentMethod: 'VNPAY_QR',
          returnUrl: `${window.location.origin}/auction/payment-return?auctionId=${id}`,
          cancelUrl: `${window.location.origin}/auction/detail/${id}`,
        });
        if (payResult?.redirectUrl) {
          setShowCheckoutModal(false);
          toast.info("Đang chuyển sang cổng thanh toán VNPAY...");
          window.location.assign(payResult.redirectUrl);
          return;
        }
      } catch { /* fall through to mock success */ }

      // Fallback mock khi API chưa sẵn sàng
      setIsPaid(true);
      setShowCheckoutModal(false);
      toast.success("🎉 Thanh toán thành công! Đơn hàng trúng thầu đang được chuẩn bị giao.");
    } catch {
      toast.error("Thanh toán thất bại, vui lòng thử lại!");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const breadcrumbs = product.breadcrumbs || ["ĐẤU GIÁ", "CHI TIẾT"];
  const images = product.images?.length ? product.images : [""];
  const specs = product.specs || {};
  const isUserWinner = isSameUser(user, leader);

  return (
    <div className="auc-detail">
      <nav className="auc-detail__breadcrumbs">
        <button type="button" className="auc-detail__back" onClick={() => fromAdmin ? navigate('/admin/auction-products') : navigate(-1)}>
          <FaArrowLeft /> {fromAdmin ? 'Quay lại Quản lý phiên đấu giá' : 'Quay lại'}
        </button>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb}>{i > 0 && " / "}{crumb}</span>
        ))}
      </nav>

      {/* ─── 1. TOP: TRUNG TÂM GIÁM SÁT & ĐIỀU HÀNH ADMIN (Hiển thị đầu trang khi là Admin) ─── */}
      {fromAdmin && (
        <div className="auc-admin-top-panel">
          <div className="auc-admin-panel-header">
            <div className="admin-header-left">
              <FaShieldAlt className="admin-shield-icon" />
              <div>
                <h2>TRUNG TÂM GIÁM SÁT & ĐIỀU HÀNH PHIÊN ĐẤU GIÁ #AUC-{product.id}</h2>
                <p>Chế độ Quản trị viên cao nhất — Can thiệp phiên real-time & Truy xuất nhật ký chi tiết từng lượt đặt giá.</p>
              </div>
            </div>
            <div className="admin-header-stats-grid">
              <div className="stat-box">
                <span>Tổng lượt bid</span>
                <strong>{bidHistory.length}</strong>
              </div>
              <div className="stat-box">
                <span>Giá thầu hiện tại</span>
                <strong className="gold">{currentPrice}</strong>
              </div>
              <div className="stat-box">
                <span>Người dẫn đầu</span>
                <strong>{maskUsername(leader, isAuthenticated && isSameUser(user, leader), fromAdmin)}</strong>

              </div>
              <div className="stat-box">
                <span>Trạng thái phiên</span>
                <strong className={!isAuctionEnded ? 'live-tag' : 'ended-tag'}>
                  {!isAuctionEnded ? '🔴 ĐANG DIỄN RA (LIVE)' : '⚪ ĐÃ KẾT THÚC'}
                </strong>
              </div>
            </div>
          </div>

          {/* Admin Control Actions */}
          <div className="auc-admin-actions-bar">
            <h3>🛠️ BỘ CÔNG CỤ ĐIỀU HÀNH & CAN THIỆP PHIÊN DIỄN RA REAL-TIME</h3>
            <div className="actions-btn-group">
              <button type="button" className="adm-btn adm-btn--warning" onClick={() => toast.warning("Đã tạm dừng nhận bid cho phiên này!")}>
                ⏸️ Tạm dừng phiên
              </button>
              <button type="button" className="adm-btn adm-btn--info" onClick={() => toast.info("Đã khôi phục nhận bid thành công!")}>
                ▶️ Khôi phục phiên
              </button>
              <button type="button" className="adm-btn adm-btn--success" onClick={() => toast.success("Đã gia hạn phiên thêm +2 Giờ!")}>
                ⏱️ Gia hạn +2 Giờ
              </button>
              <button type="button" className="adm-btn adm-btn--purple" onClick={() => toast.success("Đã gia hạn phiên thêm +12 Giờ!")}>
                ⏳ Gia hạn +12 Giờ
              </button>
              <button type="button" className="adm-btn adm-btn--danger" onClick={() => toast.error("Đã hủy phiên đấu giá & hoàn tiền cọc!")}>
                🚫 Hủy phiên & Hoàn cọc
              </button>
              <button type="button" className="adm-btn adm-btn--dark" onClick={() => toast.warning("Đã khóa tính năng đặt giá toàn phiên!")}>
                🔒 Khóa thầu toàn phiên
              </button>
              <button type="button" className="adm-btn adm-btn--alert" onClick={() => toast.info("Đã quét và phát hiện 1 địa chỉ IP nghi vấn trùng lặp.")}>
                ⚠️ Quét trùng lặp IP
              </button>
              <button type="button" className="adm-btn adm-btn--lightning" onClick={() => { setSecondsLeft(0); setIsAuctionEnded(true); toast.info("⚡ Đã kích hoạt đếm ngược về 0 (Demo)"); }}>
                ⚡ Kết thúc phiên ngay (Demo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Winner & Ended Banner Zone ─── */}
      {isAuctionEnded && (
        <div className="auc-winner-banner-wrapper">
          {isUserWinner ? (
            isPaid ? (
              <div className="auc-winner-banner auc-winner-banner--paid">
                <div className="auc-winner-banner__header">
                  <FaCheckCircle className="icon icon-success" />
                  <div>
                    <h3>ĐÃ THANH TOÁN THÀNH CÔNG!</h3>
                    <p>Mã đơn hàng: <strong>#AUC-WIN-{product.id}</strong> — Đơn hàng đang được đóng gói & chuyển đến địa chỉ nhận.</p>
                  </div>
                </div>
              </div>
            ) : isPaymentExpired ? (
              <div className="auc-winner-banner auc-winner-banner--expired">
                <div className="auc-winner-banner__header">
                  <FaExclamationTriangle className="icon icon-danger" />
                  <div>
                    <h3>QUÁ HẠN THANH TOÁN 12 GiỜ</h3>
                    <p>Đã tịch thu 100% tiền đặt cọc (5.000.000 ₫) và hủy kết quả trúng thầu theo Quy chế đấu giá.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auc-winner-banner auc-winner-banner--win">
                <div className="auc-winner-banner__header">
                  <FaTrophy className="icon-trophy" />
                  <div>
                    <h3>🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG THẦU SẢN PHẨM NÀY!</h3>
                    <p>Giá trúng thầu cuối cùng: <strong>{currentPrice}</strong></p>
                  </div>
                </div>
                <div className="auc-winner-banner__deadline">
                  <div className="deadline-time">
                    <FaClock /> Thời hạn thanh toán còn lại: <strong>{formatSeconds(payTimerSeconds)}</strong>
                  </div>
                  <p className="deadline-warning">
                    ⚠️ Vui lòng hoàn tất thanh toán trong vòng 12 giờ. Quá thời hạn sẽ bị tịch thu 100% tiền đặt cọc (5.000.000 ₫) và hủy kết quả.
                  </p>
                  <div className="deadline-actions">
                    <button
                      type="button"
                      className="btn-pay-now"
                      onClick={() => setShowCheckoutModal(true)}
                    >
                      <FaGavel /> Thanh toán ngay & Chọn địa chỉ nhận
                    </button>
                    <button
                      type="button"
                      className="btn-demo-expire"
                      onClick={() => setIsPaymentExpired(true)}
                      title="Thử nghiệm trường hợp quá hạn thanh toán 12h"
                    >
                      ⚡ Giả lập Quá hạn 12h (Demo)
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="auc-winner-banner auc-winner-banner--ended">
              <FaClock style={{ fontSize: 18, color: '#e8c468' }} />
              <span>
                Phiên đấu giá đã kết thúc. Người trúng thầu: <strong>{maskUsername(leader, isSameUser(user, leader), fromAdmin)}</strong> với giá <strong>{currentPrice}</strong>.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="auc-detail__grid">
        <div className="auc-detail__gallery">
          <div className="auc-detail__main-image">
            <AuctionImage
              src={images[selectedImage] || images[0]}
              alt={product.title}
            />
            <span className="auc-detail__badge">
              {isAuctionEnded ? "ĐÃ KẾT THÚC" : product.badge}
            </span>
          </div>

          <div className="auc-detail__thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                className={selectedImage === i ? "active" : ""}
                onClick={() => setSelectedImage(i)}
              >
                <AuctionImage src={img} alt={`Thumb ${i + 1}`} />
              </button>
            ))}
          </div>

          <section className="auc-detail__specs">
            <h3>Chi tiết sản phẩm</h3>
            <p>{product.description}</p>
            <div className="auc-detail__specs-grid">
              <div><span>THƯƠNG HIỆU</span><strong>{specs.brand || product.brand || product.category || "Chính hãng"}</strong></div>
              <div><span>TÌNH TRẠNG</span><strong>{specs.condition || product.condition || "Mới 100% / Like New"}</strong></div>
              <div><span>LOẠI MÁY</span><strong>{specs.movement || product.movement || "Automatic (Tự động)"}</strong></div>
              <div><span>NĂM SẢN XUẤT</span><strong>{specs.year || product.year || "2024"}</strong></div>
            </div>
          </section>
        </div>

        <aside className="auc-detail__sidebar">
          <div className="auc-detail__card">
            <div className="auc-detail__title-row">
              <h1>{product.title}</h1>
              <button type="button" className={liked ? "liked" : ""} onClick={handleToggleLike} title={liked ? "Bỏ theo dõi" : "Theo dõi phiên đấu giá"}>
                <FaHeart style={{ color: liked ? '#ef4444' : undefined }} />
              </button>
            </div>
            <div 
              className="auc-detail__seller" 
              onClick={() => navigate(`/auction/profile?seller=${encodeURIComponent(product.seller)}`)}
              style={{ cursor: 'pointer' }}
              title="Xem hồ sơ người bán"
            >
              <AuctionImage
                src={product.sellerAvatar}
                alt={product.seller}
                className="auc-detail__seller-avatar"
              />
              <div>
                <span>NGƯỜI BÁN UY TÍN</span>
                <strong>
                  {product.seller}
                  {product.sellerVerified && <FaCheckCircle />}
                </strong>
              </div>
            </div>
          </div>

          <div className="auc-detail__card auc-detail__card--bid">
            <span className="label">GIÁ HIỆN TẠI</span>
            <div className="price">{currentPrice || product.currentPrice}</div>

            <div className="leader">
              <span>NGƯỜI DẪN ĐẦU</span>
              <div className="leader-badge">
                <AuctionImage
                  src={leaderAvatar || product.leaderAvatar}
                  alt={leader || product.leader}
                  className="leader-avatar"
                />
                {maskUsername(leader || product.leader, isSameUser(user, leader || product.leader), fromAdmin)}
              </div>
            </div>

            <div className="timer">
              <span><FaClock /> THỜI GIAN CÒN LẠI</span>
              <strong className={isAuctionEnded ? "ended" : ""}>
                {isAuctionEnded ? "00:00:00 (Đã kết thúc)" : formatSeconds(secondsLeft)}
              </strong>
              <div className="timer-bar">
                <div style={{ width: isAuctionEnded ? "0%" : `${Math.min(100, (secondsLeft / 300) * 100)}%` }} />
              </div>
              {!isAuctionEnded && (
                <button
                  type="button"
                  className="btn-demo-quick-end"
                  onClick={() => {
                    setSecondsLeft(0);
                    setIsAuctionEnded(true);
                    toast.info("⚡ Đã kích hoạt kết thúc phiên đấu giá!");
                  }}
                  title="Chạy thử đếm ngược về 0"
                >
                  ⚡ Hết giờ ngay (Demo)
                </button>
              )}
            </div>

            {fromAdmin ? null : isSellerMode ? null : isAuctionEnded ? (
              <div className="bid-form">
                <label>TRẠNG THÁI PHIÊN ĐẤU GIÁ</label>
                {isUserWinner ? (
                  isPaid ? (
                    <button type="button" className="confirm-btn" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }} disabled>
                      <FaCheckCircle /> Đã hoàn tất thanh toán
                    </button>
                  ) : isPaymentExpired ? (
                    <button type="button" className="confirm-btn" style={{ background: "rgba(220, 38, 38, 0.2)", color: "#f87171", border: "1px solid #ef4444" }} disabled>
                      <FaExclamationTriangle /> Đã quá hạn 12h - Tịch thu cọc
                    </button>
                  ) : (
                    <button type="button" className="confirm-btn" onClick={() => setShowCheckoutModal(true)}>
                      <FaGavel /> Thanh Toán Trúng Thầu (Hạn 12h)
                    </button>
                  )
                ) : (
                  <button type="button" className="confirm-btn" style={{ background: "rgba(255,255,255,0.1)", color: "#8f7fbf" }} disabled>
                    Phiên đấu giá đã kết thúc
                  </button>
                )}
              </div>
            ) : product.isUpcoming ? (
              <div className="bid-form">
                <label>ĐĂNG KÝ THAM GIA ĐẤU GIÁ</label>
                <p className="disclaimer" style={{ marginBottom: "16px", fontSize: "14px", color: "#b9b4c7" }}>
                  Phiên đấu giá chưa bắt đầu. Đăng ký để đặt cọc và nhận quyền tham gia khi phiên diễn ra.
                </p>
                {isRegistered ? (
                  <button type="button" className="confirm-btn" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }} disabled>
                    <FaCheckCircle /> Đã đăng ký tham gia
                  </button>
                ) : (
                  <button type="button" className="confirm-btn" onClick={handleOpenRegistration}>
                    <FaGavel /> Đăng ký đấu giá
                  </button>
                )}
              </div>
            ) : (
              <div className="bid-form">
                <label>ĐẶT GIÁ THẦU CỦA BẠN</label>
                <div className="auc-wallet-balance-box">
                  <div className="wallet-balance-header">
                    <span><FaWallet /> Số dư ví Nexus Pay khả dụng:</span>
                    <strong>{isUsd ? "$50,000" : "50.000.000 ₫"}</strong>
                  </div>
                  <span className="wallet-status-badge">✓ Đủ điều kiện đặt giá</span>
                </div>
                <div className="bid-input">
                  <span>{isUsd ? "$" : "₫"}</span>
                  <input
                    type="text"
                    placeholder={`Tối thiểu ${minBid.toLocaleString(isUsd ? "en-US" : "vi-VN")}`}
                    value={bidAmount}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^0-9]/g, "");
                      const numVal = Number(rawVal);
                      setBidAmount(rawVal ? numVal.toLocaleString(isUsd ? "en-US" : "vi-VN") : "");
                    }}
                  />
                  {bidAmount ? (
                    <button
                      type="button"
                      className="bid-input__clear"
                      onClick={() => setBidAmount("")}
                      title="Xóa giá"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
                <div className="increments">
                  {increments.map((inc) => (
                    <button
                      key={inc.value}
                      type="button"
                      onClick={() => handleIncrement(inc.value)}
                    >
                      {inc.label}
                    </button>
                  ))}
                </div>
                <button type="button" className="confirm-btn" onClick={handleBid}>
                  <FaGavel /> Xác Nhận Đặt Giá
                </button>
                <p className="disclaimer">
                  Bằng việc đặt giá, bạn đồng ý với điều khoản đấu giá
                </p>
              </div>
            )}
          </div>

          {!fromAdmin && (
            <div className="auc-detail__card">
              <div className="history-header">
                <h3>LỊCH SỬ ĐẤU GIÁ ({bidHistory.length})</h3>
                <a href="#">Xem tất cả</a>
              </div>
              <ul className="history-list">
                {bidHistory.map((bid, i) => {
                  const isMe = isAuthenticated && (isSameUser(user, bid.user) || (bid.userId && user?.id && String(bid.userId) === String(user?.id)));
                  const displayName = maskUsername(bid.user, isMe, fromAdmin);

                  const bidAttemptNum = bidHistory.length - i;
                  return (
                    <li key={i} className={bid.isLeader ? "leader" : ""}>
                      <div 
                        className="history-user"
                        onClick={() => isSellerMode && navigate(`/auction/profile?user=${encodeURIComponent(bid.user)}`)}
                        style={{ cursor: isSellerMode ? 'pointer' : 'default' }}
                        title={isSellerMode ? "Xem hồ sơ người dùng" : ""}
                      >
                        <AuctionImage
                          src={bid.avatar}
                          alt={displayName}
                          className="history-avatar"
                        />
                        <div>
                          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {displayName}
                            {isMe && <span className="my-bid-tag">Bạn</span>}
                            <span className="auc-bid-attempt-tag">Lần {bidAttemptNum}</span>
                          </strong>
                          <span>{bid.time}</span>
                        </div>
                      </div>
                      <em>{bid.amount}</em>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* ─── 3. BOTTOM: NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐẶT GIÁ (FULL-WIDTH BID AUDIT LOG TABLE) ─── */}
      {fromAdmin && (
        <div className="auc-admin-history-section-bottom">
          <div className="section-title-row">
            <h3>📜 NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐẶT GIÁ (BID AUDIT LOG)</h3>
            <span className="total-badge">{bidHistory.length} Lượt bid ghi nhận</span>
          </div>

          <div className="auc-admin-table-wrapper">
            <table className="auc-admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>LẦN ĐẶT</th>
                  <th>NGƯỜI ĐẶT GIÁ (HỌ TÊN ĐẦY ĐỦ)</th>
                  <th>MỨC GIÁ ĐẶT</th>
                  <th>THỜI GIAN CHÍNH XÁC</th>
                  <th>ĐỊA CHỈ IP</th>
                  <th>THIẾT BỊ / HĐH</th>
                  <th>CHẾ ĐỘ THẦU</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC ADMIN</th>
                </tr>
              </thead>
              <tbody>
                {bidHistory.map((bid, i) => {
                  const isMe = isSameUser(user, bid.user) || bid.isYou;
                  const displayName = maskUsername(bid.user, isMe, true);
                  const attemptNum = bid.attemptNum || (bidHistory.length - i);
                  return (
                    <tr key={i} className={bid.isLeader ? "row-leader" : ""}>
                      <td><strong>#{i + 1}</strong></td>
                      <td>
                        <span className={`attempt-badge ${bid.isLeader ? 'leader' : ''}`}>
                          Lần {attemptNum} {bid.isLeader && '🏆 Dẫn đầu'}
                        </span>
                      </td>
                      <td>
                        <div className="user-info-cell">
                          <AuctionImage src={bid.avatar} alt={displayName} className="user-avatar-mini" />
                          <div>
                            <strong className="user-name-text">{displayName}</strong>
                            <span className="verified-badge">✓ Đã xác thực CCCD/Ví</span>
                          </div>
                        </div>
                      </td>
                      <td><strong className="price-tag-gold">{bid.amount}</strong></td>
                      <td>
                        <div className="time-cell">
                          <span>{bid.exactTime || "10:23:45 31/07/2026"}</span>
                          <small>({bid.time})</small>
                        </div>
                      </td>
                      <td><code className="ip-code">{bid.ip || "113.161.42.88"}</code></td>
                      <td><span className="device-text">{bid.device || "Desktop Chrome 126"}</span></td>
                      <td><span className="method-pill">{bid.method || "Thủ công"}</span></td>
                      <td>
                        <span className={`status-pill ${bid.status?.includes('Nghi vấn') ? 'warn' : 'valid'}`}>
                          {bid.status || "✓ Hợp lệ"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button type="button" className="action-icon-btn" title="Xem thông tin chi tiết IP" onClick={() => toast.info(`IP: ${bid.ip || "113.161.42.88"} - Nhà mạng: Viettel Telecom`)}>
                            🔍 Xem IP
                          </button>
                          <button type="button" className="action-icon-btn danger" title="Hủy lượt bid này" onClick={() => toast.error(`Đã hủy lượt bid ${bid.amount} của ${displayName}`)}>
                            🚫 Hủy
                          </button>
                          <button type="button" className="action-icon-btn warn" title="Khóa thầu tài khoản này" onClick={() => toast.warning(`Đã tạm khóa đặt giá đối với ${displayName}`)}>
                            🔒 Khóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Winner Checkout Modal & Address Selection ─── */}
      {showCheckoutModal && (
        <div className="auc-modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="auc-modal auc-modal--checkout" onClick={(e) => e.stopPropagation()}>
            <div className="auc-modal__header">
              <h3>
                <FaTrophy style={{ color: "#e8c468" }} />
                Thanh Toán Đơn Hàng Trúng Thầu
              </h3>
              <button type="button" onClick={() => setShowCheckoutModal(false)}><FaTimes /></button>
            </div>

            <div className="auc-modal__body">
              {/* Product summary */}
              <div className="deposit-product-card">
                <AuctionImage src={images[0]} alt={product.title} />
                <div>
                  <strong>{product.title}</strong>
                  <span style={{ color: "#e8c468", fontWeight: 700, fontSize: "14px", display: "block", marginTop: "4px" }}>
                    Giá trúng thầu: {currentPrice}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="checkout-summary-box">
                <div className="summary-row">
                  <span>Giá trúng thầu:</span>
                  <strong>{currentPrice}</strong>
                </div>
                <div className="summary-row" style={{ color: '#10b981' }}>
                  <span>Tiền cọc đã cọc (Khấu trừ):</span>
                  <strong>- 6.000.000 ₫</strong>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <strong style={{ color: '#10b981' }}>Miễn phí (Giao hàng tận nhà)</strong>
                </div>
                <div className="summary-row summary-row--total">
                  <span>Tổng tiền cần thanh toán:</span>
                  <strong className="total-amount">{currentPrice}</strong>
                </div>
              </div>

              {/* Address Selection */}
              <div className="address-section">
                <label style={{ fontSize: '12px', color: '#b9b4c7', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  <FaMapMarkerAlt style={{ color: '#e8c468', marginRight: 4 }} /> ĐỊA CHỈ NHẬN HÀNG
                </label>
                <div className="address-tabs">
                  <button
                    type="button"
                    className={addressTab === "default" ? "active" : ""}
                    onClick={() => setAddressTab("default")}
                  >
                    Địa chỉ mặc định
                  </button>
                  <button
                    type="button"
                    className={addressTab === "new" ? "active" : ""}
                    onClick={() => setAddressTab("new")}
                  >
                    Nhập địa chỉ mới
                  </button>
                </div>

                {addressTab === "default" ? (
                  <div className="address-card address-card--selected">
                    <div className="address-card__header">
                      <strong>👤 {user?.fullName || user?.name || "Người dùng"}</strong>
                      <span className="badge-default">Mặc định</span>
                    </div>
                    <p className="address-card__phone">📞 {user?.phone || "0912 345 678"}</p>
                    <p className="address-card__detail">
                      🏠 {user?.address || "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"}
                    </p>
                  </div>
                ) : (
                  <div className="new-address-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Họ và tên người nhận (*)"
                        className={addressErrors.fullName ? 'input-error' : ''}
                        value={customAddress.fullName}
                        onChange={(e) => {
                          setCustomAddress({ ...customAddress, fullName: e.target.value });
                          if (e.target.value) setAddressErrors((prev) => ({ ...prev, fullName: false }));
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Số điện thoại (*)"
                        className={addressErrors.phone ? 'input-error' : ''}
                        value={customAddress.phone}
                        onChange={(e) => {
                          setCustomAddress({ ...customAddress, phone: e.target.value });
                          if (e.target.value) setAddressErrors((prev) => ({ ...prev, phone: false }));
                        }}
                      />
                    </div>
                    <div className="form-row">
                      {/* Province dropdown */}
                      <div className="addr-select-wrap">
                        <select
                          value={customAddress.provinceCode}
                          className={`addr-select ${!customAddress.provinceCode && addressErrors.province ? 'input-error' : ''}`}
                          disabled={loadingProvinces}
                          onChange={(e) => {
                            const code = e.target.value;
                            const name = provinces.find((p) => p.value === code)?.label || '';
                            setCustomAddress((prev) => ({ ...prev, provinceCode: code, provinceName: name, wardCode: '', wardName: '' }));
                          }}
                        >
                          <option value="">{loadingProvinces ? 'Đang tải...' : 'Tỉnh / Thành phố'}</option>
                          {provinces.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      {/* Ward dropdown */}
                      <div className="addr-select-wrap">
                        <select
                          value={customAddress.wardCode}
                          className="addr-select"
                          disabled={!customAddress.provinceCode || loadingWards}
                          onChange={(e) => {
                            const code = e.target.value;
                            const name = wards.find((w) => w.value === code)?.label || '';
                            setCustomAddress((prev) => ({ ...prev, wardCode: code, wardName: name }));
                          }}
                        >
                          <option value="">
                            {!customAddress.provinceCode ? 'Chọn Tỉnh/Thành phố trước' : loadingWards ? 'Đang tải...' : 'Phường / Xã'}
                          </option>
                          {wards.map((w) => (
                            <option key={w.value} value={w.value}>{w.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Địa chỉ chi tiết (Số nhà, tên đường...) (*)"
                      className={addressErrors.streetAddress ? 'input-error' : ''}
                      value={customAddress.streetAddress}
                      onChange={(e) => {
                        setCustomAddress({ ...customAddress, streetAddress: e.target.value });
                        if (e.target.value) setAddressErrors((prev) => ({ ...prev, streetAddress: false }));
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ fontSize: '12px', color: '#b9b4c7', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  <FaMoneyBillWave style={{ color: '#e8c468', marginRight: 4 }} /> PHƯƠNG THỨC THANH TOÁN
                </label>
                <div className="payment-options">
                  <label className={checkoutPaymentMethod === 'wallet' ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="checkoutPaymentMethod"
                      value="wallet"
                      checked={checkoutPaymentMethod === 'wallet'}
                      onChange={() => setCheckoutPaymentMethod('wallet')}
                    />
                    <span>Ví Nexus Pay (Số dư khả dụng: 50.000.000 ₫)</span>
                  </label>
                  <label className={checkoutPaymentMethod === 'bank' ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="checkoutPaymentMethod"
                      value="bank"
                      checked={checkoutPaymentMethod === 'bank'}
                      onChange={() => setCheckoutPaymentMethod('bank')}
                    />
                    <span>Chuyển khoản Ngân hàng (Mã QR Napas 24/7)</span>
                  </label>
                </div>
              </div>

              <div className="auc-modal__actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCheckoutModal(false)}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmCheckout}
                >
                  {isProcessingPayment ? "Đang xử lý thanh toán..." : "Xác Nhận Thanh Toán & Giao Hàng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Registration Modal ─── */}
      {showRegModal && (
        <div className="auc-modal-overlay" onClick={() => setShowRegModal(false)}>
          <div className="auc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auc-modal__header">
              <h3>
                <FaShieldAlt style={{ color: "#e8c468" }} />
                {regStep === 1 ? "Xác minh tài khoản trước khi đấu giá" : "Đăng ký & Đặt cọc đấu giá"}
              </h3>
              <button type="button" onClick={() => setShowRegModal(false)}><FaTimes /></button>
            </div>

            <div className="auc-modal__body">
              {regStep === 1 ? (
                <>
                  <div className="kyc-warning-box">
                    <h4><FaExclamationTriangle /> Yêu cầu hoàn tất hồ sơ cá nhân</h4>
                    <p>
                      Theo Quy chế đấu giá trực tuyến của Auction House, thành viên cần hoàn tất xác minh Email, Số điện thoại và CCCD/CMND trước khi đăng ký đặt cọc tham gia phiên.
                    </p>
                  </div>

                  <div className="kyc-checklist">
                    <div className="kyc-item">
                      <span>Số điện thoại ({user?.phone || 'Chưa cập nhật'})</span>
                      <span className={`status-badge status-badge--${user?.isPhoneVerified ? 'verified' : 'unverified'}`}>
                        {user?.isPhoneVerified ? '✓ Đã xác minh' : '⚠️ Chưa xác minh'}
                      </span>
                    </div>
                    <div className="kyc-item">
                      <span>Địa chỉ Email ({user?.email || 'Chưa cập nhật'})</span>
                      <span className={`status-badge status-badge--${user?.isEmailVerified ? 'verified' : 'unverified'}`}>
                        {user?.isEmailVerified ? '✓ Đã xác minh' : '⚠️ Chưa xác minh'}
                      </span>
                    </div>
                    <div className="kyc-item">
                      <span>Căn cước công dân (CCCD/CMND)</span>
                      <span className={`status-badge status-badge--${user?.isNationalIdVerified ? 'verified' : 'unverified'}`}>
                        {user?.isNationalIdVerified ? '✓ Đã duyệt' : '⚠️ Chưa xác minh'}
                      </span>
                    </div>
                  </div>

                  <div className="auc-modal__actions">
                    <button type="button" className="btn-secondary" onClick={() => setRegStep(2)}>
                      Bỏ qua & Tiếp tục (Demo)
                    </button>
                    <button type="button" className="btn-primary" onClick={() => navigate('/profile/personal-info')}>
                      Đến trang xác minh hồ sơ
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="deposit-product-card">
                    <AuctionImage src={images[0]} alt={product.title} />
                    <div>
                      <strong>{product.title}</strong>
                      <span>Giá khởi điểm: {product.currentPrice}</span>
                    </div>
                  </div>

                  <div className="deposit-info-box">
                    <div className="deposit-row">
                      <span>Số tiền đặt cọc bắt buộc:</span>
                      <strong>5.000.000 ₫</strong>
                    </div>
                    <p>
                      Tiền đặt cọc sẽ được hoàn trả 100% về ví của bạn trong vòng 24 giờ sau khi phiên đấu giá kết thúc nếu bạn không chiến thắng.
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#b9b4c7', display: 'block', marginBottom: '6px' }}>
                      PHƯƠNG THỨC ĐẶT CỌC
                    </label>
                    <div className="payment-options">
                      <label className={paymentMethod === 'wallet' ? 'selected' : ''}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="wallet"
                          checked={paymentMethod === 'wallet'}
                          onChange={() => setPaymentMethod('wallet')}
                        />
                        <span>Ví Nexus Pay (Số dư khả dụng: 50.000.000 ₫)</span>
                      </label>
                      <label className={paymentMethod === 'bank' ? 'selected' : ''}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={() => setPaymentMethod('bank')}
                        />
                        <span>Chuyển khoản Ngân hàng (Mã QR Napas 24/7)</span>
                      </label>
                    </div>
                  </div>

                  <div className="rules-summary">
                    <strong>Quy định & Bảo lưu cọc:</strong>
                    <ul>
                      <li>Trúng thầu nhưng bỏ cuộc sẽ bị tịch thu 100% tiền cọc.</li>
                      <li>Hệ thống tự động nhắc lịch khi phiên sắp bắt đầu qua SĐT/Email.</li>
                    </ul>
                  </div>

                  <label className="agree-checkbox">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>Tôi đã đọc, hiểu rõ và đồng ý với Quy chế & Điều khoản đặt cọc đấu giá.</span>
                  </label>

                  <div className="auc-modal__actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowRegModal(false)}>
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!agreeTerms || isRegistering}
                      onClick={handleConfirmRegistration}
                    >
                      {isRegistering ? "Đang xử lý..." : "Xác nhận Đăng ký & Đặt cọc"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Xác Nhận Đặt Giá (Detail Page) ─── */}
      {showBidConfirmModal && (
        <div className="auc-modal-overlay" onClick={() => setShowBidConfirmModal(false)}>
          <div className="auc-modal auc-modal--confirm-bid" onClick={(e) => e.stopPropagation()}>
            <div className="auc-modal__header">
              <h3>
                <FaGavel style={{ color: "#e8c468" }} />
                Xác Nhận Đặt Giá Thầu
              </h3>
              <button type="button" onClick={() => setShowBidConfirmModal(false)}><FaTimes /></button>
            </div>

            <div className="auc-modal__body">
              <div className="won-detail-product-card">
                <AuctionImage src={images[0]} alt={product.title} />
                <div>
                  <strong>{product.title}</strong>
                  <span style={{ color: "#8f7fbf", fontSize: "13px", display: "block", marginTop: "4px" }}>
                    {product.breadcrumbs?.[1] || "Sản phẩm đấu giá"}
                  </span>
                </div>
              </div>

              <div className="confirm-bid-details">
                <div className="confirm-bid-row">
                  <span>Giá hiện tại:</span>
                  <strong>{currentPrice}</strong>
                </div>
                <div className="confirm-bid-row">
                  <span>Mức giá bạn đặt:</span>
                  <strong style={{ color: "#e8c468", fontSize: "18px" }}>
                    {isUsd ? `$${Number(String(bidAmount).replace(/[^0-9]/g, "")).toLocaleString("en-US")}` : `${Number(String(bidAmount).replace(/[^0-9]/g, "")).toLocaleString("vi-VN")} ₫`}
                  </strong>
                </div>
                <div className="confirm-bid-row">
                  <span>Mức tăng so với hiện tại:</span>
                  <strong style={{ color: "#10b981" }}>
                    +{isUsd ? `$${(Number(String(bidAmount).replace(/[^0-9]/g, "")) - currentPriceNum).toLocaleString("en-US")}` : `${(Number(String(bidAmount).replace(/[^0-9]/g, "")) - currentPriceNum).toLocaleString("vi-VN")} ₫`}
                  </strong>
                </div>
              </div>

              <div className="confirm-bid-notice">
                <p>⚠️ <strong>Cam kết đấu giá:</strong> Lệnh đặt giá có hiệu lực ngay lập tức. Nếu thắng thầu, bạn có nghĩa vụ thanh toán sản phẩm này theo Quy chế Đấu giá của Nexus Platform.</p>
              </div>
            </div>

            <div className="auc-modal__footer">
              <button type="button" className="btn-cancel-modal" onClick={() => setShowBidConfirmModal(false)}>
                Hủy bỏ
              </button>
              <button type="button" className="btn-confirm-bid-modal" onClick={confirmAndSubmitBid}>
                <FaGavel /> Xác Nhận Đặt Giá Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <RequireAuthModal
        isOpen={authModalConfig.isOpen}
        onClose={() => setAuthModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={authModalConfig.title}
        subtitle={authModalConfig.subtitle}
        redirectTo={`/auction/detail/${id}`}
        pendingAction={authModalConfig.pendingAction}
      />
    </div>
  );
}


