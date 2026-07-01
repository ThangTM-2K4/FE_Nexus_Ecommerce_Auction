# Ecommerce Auction — Nền tảng đấu giá trực tuyến

React + Vite frontend cho hệ thống thương mại điện tử kết hợp đấu giá. Hiện tại phần lớn dữ liệu dùng **mock/localStorage**; backend API đã có sẵn cho auth cơ bản.

## Chạy dự án

```bash
cd Ecommerce_Auction
npm install
npm run dev      # http://localhost:5173
npm run build    # build production
npm run preview  # xem bản build
```

## Tech stack

| Công nghệ | Mục đích |
|-----------|----------|
| React 18 + Vite 5 | UI SPA |
| React Router 6 | Routing |
| Sass (SCSS) | Styling |
| Axios | HTTP client |
| react-toastify | Thông báo |
| react-icons | Icon |

## Cấu trúc thư mục

```
src/
├── App.jsx                 # Route chính
├── layout/                 # Layout trang công khai (header/footer)
├── config/
│   ├── ProtectedRoute.jsx  # Guard đăng nhập / role
│   ├── SellerRoute.jsx     # Guard seller (status + chế độ SELLER)
│   └── SellerHubRoutes.jsx # Nested routes Seller Hub
├── context/
│   └── AuthContext.jsx     # Session, switch BUYER/SELLER
├── components/
│   ├── homepage/           # Header, footer, sidebar
│   ├── auction/            # Layout/header đấu giá
│   ├── sellerdashboard/    # Layout, sidebar, KPI cards seller
│   ├── staff/              # Layout, sidebar staff hub
│   └── user/profile/       # BecomeSellerSection, ...
├── pages/
│   ├── auth/               # login, register, callback, forgot/reset OTP
│   ├── homepage/           # Trang chủ
│   ├── user/               # profile, notifications, buyer dashboard
│   ├── auction/            # browse, detail, create, seller, my-bids
│   ├── seller/             # Seller Hub (xem chi tiết bên dưới)
│   ├── staff/              # Staff Hub vận hành
│   └── admin/              # Admin dashboard (skeleton)
├── services/               # auth, profile, seller, staff, reputation
├── data/                   # Mock data (sellerMockData, staffMockData, ...)
├── styles/
│   ├── _palette.scss       # Design tokens chung
│   ├── _auction-variables.scss
│   └── seller/_dashboard.scss  # CSS shared cho Seller Hub pages
└── hooks/                  # useCountUp, ...
```

## Routing

### Auth (không layout)
- `/login`, `/register`, `/forgot-password`, `/verify-otp`, `/reset-password`, `/auth/callback`

### Trang công khai (Layout chung)
- `/`, `/home` — Trang chủ
- `/profile`, `/profile/notifications` — Hồ sơ (Protected)
- `/profile/become-seller` — Đăng ký người bán (Protected)
- `/buyer` — Buyer dashboard
- `/auction/browse`, `/auction/detail/:id`, `/auction/profile`, `/auction/my-bids`
- `/auction/seller`, `/auction/create` — Kênh đấu giá seller
- `/admin` — Admin dashboard

### Seller Hub (layout riêng, `SellerRoute`)
Yêu cầu: đăng nhập + `sellerStatus === 'APPROVED'` + `currentMode === 'SELLER'`

| Route | Trang | Mô tả |
|-------|-------|-------|
| `/seller` | Redirect → `/seller-hub/overview` | Entry point |
| `/seller-hub/overview` | Tổng quan | KPI hero + stat grid |
| `/seller-hub/revenue` | Doanh thu | Biểu đồ, phân tích theo danh mục/SP |
| `/seller-hub/products` | Sản phẩm | Thống kê + bảng SP |
| `/seller-hub/orders` | Đơn hàng | Trạng thái đơn, đơn gần đây |
| `/seller-hub/customers` | Khách hàng | Phân khúc, top KH |
| `/seller-hub/performance` | Hiệu quả | Conversion funnel, kênh |
| `/seller-hub/reviews` | Đánh giá | Rating, khiếu nại |
| `/seller-hub/notifications` | Thông báo | Danh sách thông báo seller |
| `/seller-hub/wallet` | Ví & thanh toán | Số dư, giao dịch, rút tiền |

### Staff Hub (layout riêng, role STAFF/ADMIN)
- `/staff/overview`, `/staff/seller-review`, `/staff/auctions`, `/staff/disputes`
- `/staff/orders`, `/staff/reports`, `/staff/notifications` (placeholder)

## Luồng Seller

```
Chưa đăng ký seller
  └─ /profile/become-seller (wizard 6 bước)

PENDING  → SellerWaitingPage (chờ duyệt, có mock approve/reject)
REJECTED → SellerRejectedPage → nộp lại qua become-seller
APPROVED → Chuyển sang chế độ SELLER → /seller-hub/*
```

**Điều kiện đăng ký seller** (`sellerService.checkSellerPreconditions`):
- Email đã xác minh
- SĐT đã xác minh
- Đã thêm tài khoản ngân hàng
- ≥ 50 điểm uy tín buyer (`reputationService.canApplySeller`)

**Mock admin duyệt**: Trên trang become-seller khi PENDING, dùng nút "Phê duyệt (mock)" / "Từ chối (mock)" — lưu vào `localStorage`.

## Seller Hub — trạng thái triển khai

| Thành phần | Trạng thái |
|------------|------------|
| `sellerLayout`, `sellerHeader`, `sellerSidebar` | ✅ Hoàn thiện |
| `sellerKpiCard`, `sellerStatCard`, `sellerMiniStat`, `sellerAnimatedBar/Value` | ✅ Hoàn thiện |
| 9 trang hub (overview → wallet) | ✅ UI + mock data |
| `sellerMockData.js` | ✅ Dữ liệu mẫu đầy đủ |
| `sellerService.js` | ⚠️ Chỉ xử lý đơn đăng ký seller (localStorage) |
| Kết nối API backend cho dashboard | ❌ Chưa làm |
| CRUD sản phẩm / xử lý đơn thật | ❌ Chưa làm |
| Rút tiền / ví thật | ❌ Chưa làm |

## Việc cần làm tiếp (Seller)

1. **API integration**
   - Tạo `sellerDashboardService.js` gọi backend cho stats, orders, products, wallet
   - Thay mock trong từng page bằng `useEffect` + loading/error state

2. **Quản lý sản phẩm**
   - Form thêm/sửa/xóa sản phẩm
   - Upload ảnh (hiện mock file input ở become-seller)
   - Liên kết với module đấu giá (`/auction/create`)

3. **Xử lý đơn hàng**
   - Action: xác nhận, giao hàng, hủy
   - Filter/search theo trạng thái, ngày

4. **Ví & rút tiền**
   - Form yêu cầu rút tiền
   - Validate số dư khả dụng

5. **Bảo vệ route đấu giá**
   - Khôi phục `AuctionSellerRoute` (đã có trong commit cũ) nếu cần guard riêng

6. **Testing**
   - Flow: đăng ký → mock approve → switch SELLER → duyệt các tab hub

## Staff Hub — tham khảo pattern

Staff Hub đã có layout + pages tương tự Seller. Khi làm seller API, có thể mirror pattern từ `staffService.js` (mock + localStorage, sẵn sàng thay bằng API).

## Auth & chế độ tài khoản

- `AuthContext`: `currentMode` = `BUYER` | `SELLER`
- Switch mode qua `ProfileDropdown` / `SwitchAccountModal`
- Seller Hub chỉ mở khi `isSellerMode === true` và seller đã APPROVED

## Mock data chính

| File | Nội dung |
|------|----------|
| `data/sellerMockData.js` | Stats, orders, products, customers, wallet, notifications |
| `data/staffMockData.js` | Staff overview, disputes, seller applications |
| `data/auctionMockData.js` | Phiên đấu giá, sản phẩm |
| `data/sellerImages.js` | Đường dẫn ảnh `/images/auction/*` |

## Ghi chú phát triển

- CSS Seller Hub dùng prefix class `slr-*`, import qua `styles/seller/_dashboard.scss` trong `sellerLayout`
- Component seller nằm ở `components/sellerdashboard/` (trước đây là `components/seller/`)
- Palette màu: Ocean Depth (`_palette.scss`) — dùng chung homepage, auction, seller, staff
- Build đã verify: `npm run build` ✅

## Branch / Git

Branch hiện tại: `khangntd`. Seller pages từng bị mất sau refactor commit `5817d15` — đã khôi phục và cập nhật import path.

---

*Cập nhật lần cuối: 2026-07-02 — Seller Hub đầy đủ 9 trang + become-seller flow.*
