import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminTabs from "../../../components/admin/adminTabs";
import AdminTabOverview from "../../../components/admin/adminTabOverview";
import AdminToolbar from "../../../components/admin/adminToolbar";
import AdminModal from "../../../components/admin/adminModal";
import { AdminAnimatedView } from "../../../components/admin/adminPageTransition";
import {
  ProductCard, AuctionCard, CategoryTreeItem, BrandChip, InventoryGauge,
  SellerProductGroup, SellerInventorySection,
} from "../../../components/admin/adminViews";
import { useAdminList } from "../../../hooks/useAdminList";
import {
  mockProducts, mockAuctions, mockCategories, mockBrands, mockInventory,
  mockSellerWarehouses, STATUS_OPTIONS,
} from "../../../data/adminEntities";
import "../../../components/admin/adminViews/index.scss";
import "../../../components/admin/adminDataTable/index.scss";
import "../../../components/admin/adminTabOverview/index.scss";

const getWarehouse = (seller) => mockSellerWarehouses.find((w) => w.seller === seller);

const calcProductStats = (products) => ({
  displayed: products.filter((p) => p.status === "Hoạt động").length,
  inStock: products.reduce((s, p) => s + (p.quantity || 0), 0),
  skus: products.length,
});

const calcInventoryStats = (items, products) => ({
  displayed: products.filter((p) => p.status === "Hoạt động").length,
  inStock: items.reduce((s, i) => s + (i.stock || 0), 0),
  alerts: items.filter((i) => i.status === "Sắp hết" || i.status === "Hết hàng").length,
});

const groupBySeller = (items, sellerKey = "seller") => {
  const map = new Map();
  items.forEach((item) => {
    const key = item[sellerKey];
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return [...map.entries()].map(([seller, groupItems]) => ({ seller, items: groupItems }));
};

export const AdminProducts = () => {
  const [sellerTab, setSellerTab] = useState("all");
  const list = useAdminList(mockProducts, ["name", "seller", "id"]);
  const [detail, setDetail] = useState(null);
  const action = (row, status) => { list.updateItem(row.id, { status }); toast.success(`Đã cập nhật: ${status}`); };

  const sellers = useMemo(
    () => [...new Set(mockProducts.map((p) => p.seller))],
    [],
  );

  const visibleProducts = sellerTab === "all"
    ? list.filtered
    : list.filtered.filter((p) => p.seller === sellerTab);

  const sellerGroups = useMemo(() => {
    const groups = groupBySeller(visibleProducts);
    return groups.sort((a, b) => a.seller.localeCompare(b.seller));
  }, [visibleProducts]);

  const platformStats = calcProductStats(list.filtered);

  const overview = sellerTab === "all"
    ? {
        title: "Tổng quan sản phẩm toàn sàn",
        description: "Marketplace đa seller — mỗi shop tự quản lý kho và danh mục riêng, admin giám sát & duyệt.",
        stats: [
          { label: "Tổng SKU", value: list.filtered.length, highlight: true },
          { label: "Đang trưng bày", value: platformStats.displayed, hint: "status Hoạt động" },
          { label: "Trong kho", value: platformStats.inStock.toLocaleString("vi-VN"), hint: "tổng số lượng tồn" },
          { label: "Seller", value: sellers.length, hint: "shop đang có SP" },
          { label: "Chờ duyệt", value: list.filtered.filter((p) => p.status === "Chờ duyệt").length, warn: true },
        ],
      }
    : {
        title: `Shop: ${sellerTab}`,
        description: getWarehouse(sellerTab)
          ? `Quản lý kho: ${getWarehouse(sellerTab).warehouseManager} · ${getWarehouse(sellerTab).address}`
          : "Chi tiết sản phẩm theo seller.",
        stats: (() => {
          const s = calcProductStats(visibleProducts);
          return [
            { label: "SKU", value: visibleProducts.length, highlight: true },
            { label: "Đang trưng bày", value: s.displayed },
            { label: "Trong kho", value: s.inStock.toLocaleString("vi-VN") },
            { label: "Chờ duyệt", value: visibleProducts.filter((p) => p.status === "Chờ duyệt").length, warn: true },
          ];
        })(),
      };

  const productActions = (p) => [
    { label: "Xem", variant: "primary", onClick: () => setDetail(p) },
    ...(p.status === "Chờ duyệt" ? [
      { label: "Duyệt", variant: "success", onClick: () => action(p, "Hoạt động") },
      { label: "Từ chối", variant: "danger", onClick: () => action(p, "Từ chối") },
    ] : []),
    { label: p.status === "Ẩn" ? "Hiện" : "Ẩn", onClick: () => action(p, p.status === "Ẩn" ? "Hoạt động" : "Ẩn") },
    { label: "Xóa", variant: "danger", onClick: () => { list.removeItem(p.id); toast.info("Đã xóa"); } },
  ];

  return (
    <div className="adm-page">
      <AdminPageHeader
        kicker="Sản phẩm"
        title="Quản lý sản phẩm đa seller"
        subtitle="Giám sát sản phẩm theo từng shop — mỗi seller có kho và người quản lý kho riêng."
      />
      <AdminTabOverview {...overview} />
      <AdminTabs
        active={sellerTab}
        onChange={setSellerTab}
        tabs={[
          { id: "all", label: "Tất cả seller", count: list.filtered.length },
          ...sellers.map((s) => ({
            id: s,
            label: s,
            count: list.filtered.filter((p) => p.seller === s).length,
          })),
        ]}
      />
      <AdminToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Tìm sản phẩm, seller..."
        filters={[{
          key: "status", label: "Tất cả trạng thái", value: list.filter.status || "",
          onChange: (v) => list.setFilterValue("status", v), options: STATUS_OPTIONS.general,
        }]}
      />
      <AdminAnimatedView viewKey={sellerTab}>
        {sellerGroups.map(({ seller, items }) => (
          <SellerProductGroup
            key={seller}
            seller={seller}
            warehouse={getWarehouse(seller)}
            stats={calcProductStats(items)}
          >
            {items.map((p) => (
              <ProductCard key={p.id} product={p} actions={productActions(p)} />
            ))}
          </SellerProductGroup>
        ))}
      </AdminAnimatedView>
      <AdminModal open={!!detail} title="Chi tiết sản phẩm" onClose={() => setDetail(null)} wide>
        {detail && (
          <dl className="adm-detail-grid">
            {Object.entries(detail).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}
          </dl>
        )}
      </AdminModal>
    </div>
  );
};

export const AdminAuctionProducts = () => {
  const list = useAdminList(mockAuctions, ["title", "seller", "id"]);
  const [detail, setDetail] = useState(null);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đấu giá" title="Quản lý phiên đấu giá" subtitle="Giám sát, dừng, gia hạn hoặc hủy phiên đấu giá." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm phiên, seller..." />
      <div className="adm-auction-grid">
        {list.filtered.map((a) => (
          <AuctionCard
            key={a.id}
            auction={a}
            actions={[
              { label: "Chi tiết", variant: "primary", onClick: () => setDetail(a) },
              { label: `${a.bids} bid`, onClick: () => toast.info("Xem lịch sử bid") },
              ...(a.status === "Đang diễn ra" || a.status === "Sắp kết thúc" ? [
                { label: "Dừng", variant: "danger", onClick: () => { list.updateItem(a.id, { status: "Đã dừng" }); toast.warning("Đã dừng phiên"); } },
                { label: "Gia hạn", onClick: () => toast.success("Đã gia hạn 2 giờ") },
                { label: "Hủy", variant: "danger", onClick: () => { list.updateItem(a.id, { status: "Đã hủy" }); toast.error("Đã hủy"); } },
              ] : []),
            ]}
          />
        ))}
      </div>
      <AdminModal open={!!detail} title="Chi tiết phiên đấu giá" onClose={() => setDetail(null)} wide>
        {detail && <dl className="adm-detail-grid">{Object.entries(detail).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}</dl>}
      </AdminModal>
    </div>
  );
};

export const AdminCategories = () => {
  const list = useAdminList(mockCategories, ["name", "id"]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const save = () => {
    if (modal === "add") list.addItem({ ...form, id: `DM-${Date.now()}`, status: form.status || "Hoạt động", productCount: 0 });
    else list.updateItem(form.id, form);
    toast.success("Đã lưu");
    setModal(null);
  };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Danh mục" title="Quản lý danh mục" subtitle="Cây danh mục và danh mục con." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} actions={[{ label: "+ Thêm danh mục", onClick: () => { setForm({}); setModal("add"); } }]} />
      <div className="adm-category-list">
        {list.filtered.map((cat) => (
          <CategoryTreeItem
            key={cat.id}
            cat={cat}
            onEdit={() => { setForm({ ...cat }); setModal("edit"); }}
            onToggle={() => { const n = cat.status === "Hoạt động" ? "Tắt" : "Hoạt động"; list.updateItem(cat.id, { status: n }); toast.success(`Đã ${n === "Tắt" ? "tắt" : "bật"}`); }}
            onDelete={() => { list.removeItem(cat.id); toast.info("Đã xóa"); }}
          />
        ))}
      </div>
      <AdminModal open={!!modal} title={modal === "add" ? "Thêm danh mục" : "Sửa danh mục"} onClose={() => setModal(null)}>
        <div className="adm-form">
          <label>Tên<input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Danh mục cha
            <select value={form.parent || ""} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
              {["—", "Điện thoại", "Laptop", "Đồng hồ", "Thời trang"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <div className="adm-form__actions">
            <button type="button" className="cancel" onClick={() => setModal(null)}>Hủy</button>
            <button type="button" className="save" onClick={save}>Lưu</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export const AdminBrands = () => {
  const list = useAdminList(mockBrands, ["name"]);
  const [form, setForm] = useState(null);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Thương hiệu" title="Quản lý thương hiệu" subtitle="CRUD thương hiệu sản phẩm." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} actions={[{ label: "+ Thêm thương hiệu", onClick: () => setForm({ name: "", status: "Hoạt động" }) }]} />
      <div className="adm-brand-grid">
        {list.filtered.map((b) => (
          <BrandChip
            key={b.id}
            brand={b}
            onEdit={() => setForm({ ...b })}
            onToggle={() => { const n = b.status === "Hoạt động" ? "Tắt" : "Hoạt động"; list.updateItem(b.id, { status: n }); toast.success("Đã cập nhật"); }}
            onDelete={() => { list.removeItem(b.id); toast.info("Đã xóa"); }}
          />
        ))}
      </div>
      <AdminModal open={!!form} title={form?.id ? "Sửa thương hiệu" : "Thêm thương hiệu"} onClose={() => setForm(null)}>
        <div className="adm-form">
          <label>Tên<input value={form?.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <div className="adm-form__actions">
            <button type="button" className="cancel" onClick={() => setForm(null)}>Hủy</button>
            <button type="button" className="save" onClick={() => {
              if (form.id) list.updateItem(form.id, form);
              else list.addItem({ ...form, id: `TH-${Date.now()}`, productCount: 0, createdAt: "05/07/2026" });
              toast.success("Đã lưu"); setForm(null);
            }}>Lưu</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export const AdminInventory = () => {
  const [sellerTab, setSellerTab] = useState("all");
  const list = useAdminList(mockInventory, ["product", "seller", "sku"]);

  const sellers = useMemo(
    () => [...new Set(mockInventory.map((i) => i.seller))],
    [],
  );

  const visibleItems = sellerTab === "all"
    ? list.filtered
    : list.filtered.filter((i) => i.seller === sellerTab);

  const sellerGroups = useMemo(() => {
    const groups = groupBySeller(visibleItems);
    return groups.sort((a, b) => a.seller.localeCompare(b.seller));
  }, [visibleItems]);

  const allProducts = mockProducts;
  const platformInvStats = {
    displayed: allProducts.filter((p) => p.status === "Hoạt động").length,
    inStock: list.filtered.reduce((s, i) => s + (i.stock || 0), 0),
    alerts: list.filtered.filter((i) => i.status === "Sắp hết" || i.status === "Hết hàng").length,
  };

  const overview = sellerTab === "all"
    ? {
        title: "Tổng quan tồn kho toàn sàn",
        description: "Mỗi seller quản lý kho riêng — admin giám sát tồn kho và cảnh báo hết hàng.",
        stats: [
          { label: "Đang trưng bày", value: platformInvStats.displayed, highlight: true },
          { label: "Trong kho", value: platformInvStats.inStock.toLocaleString("vi-VN"), hint: "tổng đơn vị tồn" },
          { label: "Seller có kho", value: sellers.length },
          { label: "Cảnh báo", value: platformInvStats.alerts, warn: true },
        ],
      }
    : {
        title: `Kho: ${sellerTab}`,
        description: getWarehouse(sellerTab)
          ? `QL kho: ${getWarehouse(sellerTab).warehouseManager} · Liên hệ: ${getWarehouse(sellerTab).phone}`
          : "Tồn kho theo seller.",
        stats: (() => {
          const s = calcInventoryStats(visibleItems, allProducts.filter((p) => p.seller === sellerTab));
          return [
            { label: "SKU", value: visibleItems.length, highlight: true },
            { label: "Đang trưng bày", value: s.displayed },
            { label: "Trong kho", value: s.inStock.toLocaleString("vi-VN") },
            { label: "Cảnh báo", value: s.alerts, ...(s.alerts > 0 ? { warn: true } : {}) },
          ];
        })(),
      };

  return (
    <div className="adm-page">
      <AdminPageHeader
        kicker="Kho hàng"
        title="Giám sát tồn kho đa seller"
        subtitle="Theo dõi tồn kho từng shop — mỗi seller có người quản lý kho riêng."
      />
      <AdminTabOverview {...overview} />
      <AdminTabs
        active={sellerTab}
        onChange={setSellerTab}
        tabs={[
          { id: "all", label: "Tất cả kho", count: list.filtered.length },
          ...sellers.map((s) => ({
            id: s,
            label: s,
            count: list.filtered.filter((i) => i.seller === s).length,
          })),
        ]}
      />
      <AdminToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Tìm sản phẩm, seller..."
        filters={[{ key: "status", label: "Tất cả", value: list.filter.status || "", onChange: (v) => list.setFilterValue("status", v), options: [
          { value: "Đủ hàng", label: "Đủ hàng" }, { value: "Sắp hết", label: "Sắp hết" }, { value: "Hết hàng", label: "Hết hàng" },
        ]}]}
      />
      <AdminAnimatedView viewKey={sellerTab}>
        {sellerGroups.map(({ seller, items }) => (
          <SellerInventorySection
            key={seller}
            seller={seller}
            warehouse={getWarehouse(seller)}
            stats={calcInventoryStats(items, allProducts.filter((p) => p.seller === seller))}
          >
            {items.map((item) => (
              <InventoryGauge key={item.id} item={item} onSync={() => toast.success(`Đã đồng bộ ${item.sku}`)} />
            ))}
          </SellerInventorySection>
        ))}
      </AdminAnimatedView>
    </div>
  );
};
