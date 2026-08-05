import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminTabs from "../../../components/admin/adminTabs";
import AdminTabOverview from "../../../components/admin/adminTabOverview";
import AdminToolbar from "../../../components/admin/adminToolbar";
import AdminModal from "../../../components/admin/adminModal";
import AdminStatusBadge from "../../../components/admin/adminStatusBadge";
import { AdminAnimatedView } from "../../../components/admin/adminPageTransition";
import {
  ProductCard, AuctionCard, CategoryTreeItem, BrandChip, InventoryGauge,
  SellerProductGroup, SellerInventorySection, ProductListRow, AuctionListRow,
} from "../../../components/admin/adminViews";


import Select from "../../../components/common/select";
import { useAdminList } from "../../../hooks/useAdminList";
import {
  mockProducts, mockAuctions, mockCategories, mockBrands, mockInventory,
  mockSellerWarehouses, STATUS_OPTIONS,
} from "../../../data/adminEntities";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../../services/adminCategoryService";
import {
  getAdminProducts,
  approveAdminProduct,
  rejectAdminProduct,
  getApiErrorMessage,
} from "../../../services/adminProductService";
import "../../../components/admin/adminViews/index.scss";

import "../../../components/admin/adminDataTable/index.scss";
import "../../../components/admin/adminTabOverview/index.scss";

const CATEGORY_STATUS_OPTIONS = [
  { value: "Hoạt động", label: "Hoạt động" },
  { value: "Tắt", label: "Tắt" },
];

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
  const [viewMode, setViewMode] = useState("grid");
  const list = useAdminList([], ["name", "seller", "id"]);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await getAdminProducts();
        list.setItems(res?.items ?? []);
      } catch {
        list.setItems([]);
      }
    }
    loadProducts();
  }, []);

  const action = (row, status) => { list.updateItem(row.id, { status }); toast.success(`Đã cập nhật: ${status}`); };

  const isPendingReview = (status) => {
    const normalized = String(status || "").toLowerCase();
    return normalized.includes("chờ") || normalized.includes("pending") || normalized.includes("review");
  };

  const handleApprove = async (row) => {
    try {
      await approveAdminProduct(row.id);
      list.updateItem(row.id, { status: "Hoạt động" });
      toast.success("Đã duyệt sản phẩm");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Duyệt sản phẩm thất bại"));
    }
  };

  const handleReject = async (row) => {
    try {
      await rejectAdminProduct(row.id, "Không đạt yêu cầu kiểm duyệt");
      list.updateItem(row.id, { status: "Từ chối" });
      toast.success("Đã từ chối sản phẩm");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Từ chối sản phẩm thất bại"));
    }
  };

  const sellers = useMemo(
    () => [...new Set(list.items.map((p) => p.seller))],
    [list.items],
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
    ...(isPendingReview(p.status) ? [
      { label: "Duyệt", variant: "success", onClick: () => handleApprove(p) },
      { label: "Từ chối", variant: "danger", onClick: () => handleReject(p) },
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminAnimatedView viewKey={sellerTab}>
        <div>
          {sellerGroups.map(({ seller, items }) => (
            <SellerProductGroup
              key={seller}
              seller={seller}
              warehouse={getWarehouse(seller)}
              stats={calcProductStats(items)}
              viewMode={viewMode}
            >
              {items.map((p) => (
                viewMode === "grid" ? (
                  <ProductCard key={p.id} product={p} actions={productActions(p)} />
                ) : (
                  <ProductListRow key={p.id} product={p} actions={productActions(p)} />
                )
              ))}
            </SellerProductGroup>
          ))}

        </div>
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
  const navigate = useNavigate();
  const list = useAdminList([], ["title", "seller", "id"]);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    async function loadRealData() {
      const localProposals = JSON.parse(localStorage.getItem("auc_my_proposals") || "[]").map(p => {
        const rawStatus = typeof p.status === "object" ? p.status?.label : p.status;
        const statusStr = rawStatus || "Chờ duyệt đề xuất";
        return {
          id: p.id,
          title: p.title,
          seller: p.sellerName || "Fashion Elite (Seller)",
          startPrice: `${(p.startingPrice || 0).toLocaleString()}đ`,
          currentPrice: `${(p.startingPrice || 0).toLocaleString()}đ`,
          highestBid: "—",
          winner: "—",
          endTime: statusStr === "Đang diễn ra" ? "2d 23h" : (statusStr === "Đã duyệt" ? "Chờ xuất bản" : "Chờ duyệt"),
          status: statusStr,
          bids: 0,
        };
      });

      try {
        const [proposalsRes, auctionsRes] = await Promise.all([
          getAuctionProposals().catch(() => ({ items: [] })),
          getAuctions().catch(() => ({ items: [] })),
        ]);
        const proposalItems = (proposalsRes?.items || []).map(p => ({
          id: p.id,
          title: p.title,
          seller: p.sellerName || "Seller",
          startPrice: `${(p.startingPrice || 0).toLocaleString()}đ`,
          currentPrice: `${(p.startingPrice || 0).toLocaleString()}đ`,
          highestBid: "—",
          winner: "—",
          endTime: "Chờ duyệt",
          status: p.status || "Chờ duyệt đề xuất",
          bids: 0,
        }));
        const auctionItems = auctionsRes?.items || [];
        list.setItems([...localProposals, ...proposalItems, ...auctionItems]);
      } catch {
        list.setItems(localProposals);
      }
    }
    loadRealData();
  }, []);

  const handleApproveProposal = async (item) => {
    try {
      await approveAuctionProposal(item.id);
    } catch {}
    list.updateItem(item.id, { status: "Đã duyệt", endTime: "Chờ xuất bản" });

    try {
      const proposals = JSON.parse(localStorage.getItem("auc_my_proposals") || "[]");
      const updated = proposals.map((p) => {
        if (String(p.id) === String(item.id)) {
          return { ...p, status: { label: "Đã duyệt", type: "approved", color: "green" } };
        }
        return p;
      });
      localStorage.setItem("auc_my_proposals", JSON.stringify(updated));
    } catch {}

    toast.success(`🎉 Đã duyệt đề xuất phiên đấu giá "${item.title}"!`);
  };

  const handleRejectProposal = async (item) => {
    try {
      await rejectAuctionProposal(item.id, "Từ chối bởi Admin");
    } catch {}
    list.updateItem(item.id, { status: "Đã từ chối" });

    try {
      const proposals = JSON.parse(localStorage.getItem("auc_my_proposals") || "[]");
      const updated = proposals.map((p) => {
        if (String(p.id) === String(item.id)) {
          return { ...p, status: { label: "Đã từ chối", type: "rejected", color: "red" } };
        }
        return p;
      });
      localStorage.setItem("auc_my_proposals", JSON.stringify(updated));
    } catch {}

    toast.warning(`Đã từ chối đề xuất "${item.title}"`);
  };

  const handlePublish = async (item) => {
    try {
      await publishAuction(item.id);
    } catch {}
    list.updateItem(item.id, { status: "Đang diễn ra", endTime: "2d 23h" });

    try {
      const proposals = JSON.parse(localStorage.getItem("auc_my_proposals") || "[]");
      const updated = proposals.map((p) => {
        if (String(p.id) === String(item.id)) {
          return { ...p, status: { label: "Đang diễn ra", type: "active", color: "green" } };
        }
        return p;
      });
      localStorage.setItem("auc_my_proposals", JSON.stringify(updated));
    } catch {}

    const published = JSON.parse(localStorage.getItem("auc_published_auctions") || "[]");
    const newAuction = {
      id: item.id || `DG-${Date.now().toString().slice(-4)}`,
      title: item.title,
      description: item.description || "Phiên đấu giá vừa được Admin phê duyệt",
      category: item.categoryName || "Đồng hồ",
      categoryLabel: item.categoryName || "Đồng hồ",
      currentBid: Number(String(item.startPrice).replace(/[^0-9]/g, "")) || 10000000,
      currentPrice: item.startPrice || "10.000.000đ",
      startingPrice: Number(String(item.startPrice).replace(/[^0-9]/g, "")) || 10000000,
      bidIncrement: 500000,
      depositAmount: 1000000,
      image: item.image || "/images/auction/default.png",
      images: [item.image || "/images/auction/default.png"],
      location: "TP.HCM",
      postedAt: Date.now(),
      endTime: Date.now() + 86400000 * 3,
      isUpcoming: false,
      listingType: "Cá nhân",
      status: "Đang diễn ra",
    };
    localStorage.setItem("auc_published_auctions", JSON.stringify([newAuction, ...published]));

    toast.success(`🚀 Đã xuất bản phiên đấu giá "${item.title}" lên Sảnh Đấu Giá chính!`);
  };

  const tabs = [
    { id: "all", label: "Tất cả", count: list.items.length },
    { id: "pending_proposal", label: "Chờ duyệt đề xuất", count: list.items.filter((a) => a.status === "Chờ duyệt đề xuất").length },
    { id: "live", label: "Đang diễn ra", count: list.items.filter((a) => a.status === "Đang diễn ra").length },
    { id: "upcoming", label: "Sắp kết thúc", count: list.items.filter((a) => a.status === "Sắp kết thúc").length },
    { id: "completed", label: "Hoàn thành", count: list.items.filter((a) => a.status === "Hoàn thành").length },
    { id: "cancelled", label: "Đã hủy / Dừng", count: list.items.filter((a) => a.status === "Đã hủy" || a.status === "Đã dừng").length },
  ];

  const displayedList = useMemo(() => {
    return list.filtered.filter((a) => {
      if (activeTab === "pending_proposal") return a.status === "Chờ duyệt đề xuất";
      if (activeTab === "live") return a.status === "Đang diễn ra";
      if (activeTab === "upcoming") return a.status === "Sắp kết thúc";
      if (activeTab === "completed") return a.status === "Hoàn thành";
      if (activeTab === "cancelled") return a.status === "Đã hủy" || a.status === "Đã dừng";
      return true;
    });
  }, [list.filtered, activeTab]);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đấu giá" title="Quản lý phiên đấu giá & Duyệt đề xuất" subtitle="Phê duyệt đề xuất đấu giá của Seller, xuất bản sảnh chính, giám sát hoặc hủy phiên." />
      <AdminTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <AdminToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Tìm phiên, seller..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
        <div className="adm-auction-grid">
          {displayedList.map((a) => {
            const isPending = a.status === "Chờ duyệt đề xuất";
            const isLive = a.status === "Đang diễn ra" || a.status === "Sắp kết thúc";
            const actions = [
              { label: "Chi tiết", variant: "primary", onClick: () => setDetail(a) },
              ...(isPending ? [
                { label: "✅ Duyệt đề xuất", variant: "success", onClick: () => handleApproveProposal(a) },
                { label: "🚀 Xuất bản sảnh", variant: "primary", onClick: () => handlePublish(a) },
                { label: "❌ Từ chối", variant: "danger", onClick: () => handleRejectProposal(a) },
              ] : []),
              ...(isLive ? [
                { label: "👁️ Xem live", variant: "success", onClick: () => navigate(`/auction/detail/1?from=admin`) },
                { label: `${a.bids} bid`, onClick: () => toast.info("Xem lịch sử bid") },
                { label: "Dừng", variant: "danger", onClick: () => { list.updateItem(a.id, { status: "Đã dừng" }); toast.warning("Đã dừng phiên"); } },
                { label: "Gia hạn", onClick: () => toast.success("Đã gia hạn 2 giờ") },
                { label: "Hủy", variant: "danger", onClick: () => { list.updateItem(a.id, { status: "Đã hủy" }); toast.error("Đã hủy"); } },
              ] : []),
            ];

            return (
              <AuctionCard
                key={a.id}
                auction={a}
                actions={actions}
              />
            );
          })}
        </div>
      ) : (
        <div className="adm-list-container">
          {displayedList.map((a) => {
            const isPending = a.status === "Chờ duyệt đề xuất";
            const isLive = a.status === "Đang diễn ra" || a.status === "Sắp kết thúc";
            const actions = [
              { label: "Chi tiết", variant: "primary", onClick: () => setDetail(a) },
              ...(isPending ? [
                { label: "✅ Duyệt đề xuất", variant: "success", onClick: () => handleApproveProposal(a) },
                { label: "🚀 Xuất bản sảnh", variant: "primary", onClick: () => handlePublish(a) },
                { label: "❌ Từ chối", variant: "danger", onClick: () => handleRejectProposal(a) },
              ] : []),
              ...(isLive ? [
                { label: "👁️ Xem live", variant: "success", onClick: () => navigate(`/auction/detail/1?from=admin`) },
                { label: `${a.bids} bid`, onClick: () => toast.info("Xem lịch sử bid") },
                { label: "Dừng", variant: "danger", onClick: () => { list.updateItem(a.id, { status: "Đã dừng" }); toast.warning("Đã dừng phiên"); } },
                { label: "Gia hạn", onClick: () => toast.success("Đã gia hạn 2 giờ") },
                { label: "Hủy", variant: "danger", onClick: () => { list.updateItem(a.id, { status: "Đã hủy" }); toast.error("Đã hủy"); } },
              ] : []),
            ];

            return (
              <AuctionListRow
                key={a.id}
                auction={a}
                actions={actions}
              />
            );
          })}
        </div>
      )}

      <AdminModal open={!!detail} title="Chi tiết phiên đấu giá" onClose={() => setDetail(null)} wide>
        {detail && <dl className="adm-detail-grid">{Object.entries(detail).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}</dl>}
      </AdminModal>
    </div>
  );
};

export const AdminCategories = () => {
  const list = useAdminList([], ["name", "id"]);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null); // null | "add-parent" | "add-child" | "edit-parent" | "edit-child"
  const [form, setForm] = useState({});
  const [activeParentId, setActiveParentId] = useState(null);

  const reloadCategories = async () => {
    try {
      const res = await getCategories();
      list.setItems(res || []);
    } catch {
      list.setItems([]);
    }
  };

  useEffect(() => {
    reloadCategories();
  }, []);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalChildren = list.filtered.reduce((s, cat) => s + (cat.children?.length ?? 0), 0);
  const totalProducts = list.filtered.reduce((s, cat) => s + (cat.productCount ?? 0), 0);

  // ── Parent actions ─────────────────────────────────────────────
  const handleEditParent = (cat) => {
    setForm({ id: cat.id, name: cat.name, description: cat.description || "", icon: cat.icon, status: cat.status, rowVersion: cat.rowVersion });
    setModal("edit-parent");
  };

  const handleToggleParent = async (cat) => {
    const nextStatus = cat.status === "Hoạt động" ? "Tắt" : "Hoạt động";
    try {
      await updateCategory(cat.id, {
        name: cat.name,
        description: cat.description || "",
        isActive: nextStatus === "Hoạt động",
        rowVersion: cat.rowVersion,
      });
      list.updateItem(cat.id, { status: nextStatus });
      toast.success(`Danh mục "${cat.name}" đã ${nextStatus === "Tắt" ? "tắt" : "bật"}`);
      reloadCategories();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Thao tác thất bại"));
    }
  };

  const handleDeleteParent = async (cat) => {
    try {
      await deleteCategory(cat.id, "Xóa bởi Admin");
      list.removeItem(cat.id);
      toast.info(`Đã xóa "${cat.name}"`);
      reloadCategories();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Xóa danh mục thất bại"));
    }
  };

  const handleAddChild = (parentId) => {
    setActiveParentId(parentId);
    setForm({ name: "", description: "", status: "Hoạt động" });
    setModal("add-child");
  };

  // ── Child actions ──────────────────────────────────────────────
  const handleEditChild = (parentId, child) => {
    setActiveParentId(parentId);
    setForm({ ...child });
    setModal("edit-child");
  };

  const handleToggleChild = async (parentId, child) => {
    const nextStatus = child.status === "Hoạt động" ? "Tắt" : "Hoạt động";
    const parent = list.filtered.find((c) => c.id === parentId);
    if (!parent) return;
    try {
      await updateCategory(child.id, {
        name: child.name,
        isActive: nextStatus === "Hoạt động",
        parentCategoryId: parent.categoryId || parent.id,
        rowVersion: child.rowVersion,
      });
      const newChildren = parent.children.map((c) => c.id === child.id ? { ...c, status: nextStatus } : c);
      list.updateItem(parentId, { children: newChildren });
      toast.success(`"${child.name}" đã ${nextStatus === "Tắt" ? "tắt" : "bật"}`);
      reloadCategories();
    } catch (err) {
      reloadCategories();
      toast.error(getApiErrorMessage(err, "Thao tác thất bại"));
    }
  };

  const handleDeleteChild = async (parentId, child) => {
    const parent = list.filtered.find((c) => c.id === parentId);
    if (!parent) return;
    try {
      await deleteCategory(child.id, "Xóa bởi Admin");
      list.updateItem(parentId, { children: parent.children.filter((c) => c.id !== child.id) });
      toast.info(`Đã xóa "${child.name}"`);
      reloadCategories();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Xóa danh mục con thất bại"));
    }
  };

  // ── Save ───────────────────────────────────────────────────────
  const save = async () => {
    try {
      if (modal === "add-parent") {
        await createCategory({
          name: form.name,
          description: form.description || "",
          imageUrl: form.imageUrl || form.image || "",
          isActive: form.status === "Hoạt động",
          parentCategoryId: null,
        });
      } else if (modal === "edit-parent") {
        await updateCategory(form.id, {
          name: form.name,
          description: form.description || "",
          imageUrl: form.imageUrl || form.image || "",
          isActive: form.status === "Hoạt động",
          parentCategoryId: null,
          rowVersion: form.rowVersion,
        });
      } else if (modal === "add-child") {
        const parent = list.filtered.find((c) => c.id === activeParentId);
        if (!parent) return;
        await createCategory({
          name: form.name,
          description: form.description || "",
          imageUrl: form.imageUrl || form.image || "",
          isActive: form.status === "Hoạt động",
          parentCategoryId: parent.categoryId || parent.id,
        });
      } else if (modal === "edit-child") {
        const parent = list.filtered.find((c) => c.id === activeParentId);
        if (!parent) return;
        await updateCategory(form.id, {
          name: form.name,
          description: form.description || "",
          imageUrl: form.imageUrl || form.image || "",
          isActive: form.status === "Hoạt động",
          parentCategoryId: parent.categoryId || parent.id,
          rowVersion: form.rowVersion,
        });
      }
      toast.success("Đã lưu danh mục thành công");
      setModal(null);
      reloadCategories();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lưu danh mục thất bại"));
    }
  };

  const modalTitle = {
    "add-parent": "Thêm danh mục cha",
    "edit-parent": "Sửa danh mục cha",
    "add-child": "Thêm danh mục con",
    "edit-child": "Sửa danh mục con",
  }[modal];

  return (
    <div className="adm-page">
      <AdminPageHeader
        kicker="Danh mục"
        title="Quản lý danh mục"
        subtitle="Cây danh mục 2 tầng — danh mục cha chứa các danh mục con."
      />

      {/* Overview stats */}
      <div className="adm-cat-stats">
        <div className="adm-cat-stat"><span>{list.filtered.length}</span><small>Danh mục cha</small></div>
        <div className="adm-cat-stat"><span>{totalChildren}</span><small>Danh mục con</small></div>
        <div className="adm-cat-stat"><span>{totalProducts.toLocaleString("vi-VN")}</span><small>Tổng sản phẩm</small></div>
        <div className="adm-cat-stat warn">
          <span>{list.filtered.filter((c) => c.status !== "Hoạt động").length}</span>
          <small>Đang tắt</small>
        </div>
      </div>

      <AdminToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Tìm danh mục..."
        actions={[{ label: "+ Thêm danh mục cha", onClick: () => { setForm({ name: "", description: "", imageUrl: "", status: "Hoạt động" }); setModal("add-parent"); } }]}
      />

      <div className="adm-category-tree">
        {list.filtered.map((cat) => (
          <div key={cat.id} className={`adm-cat-group ${cat.status !== "Hoạt động" ? "disabled" : ""}`}>
            {/* ── Parent row ── */}
            <div className="adm-cat-parent">
              <button
                type="button"
                className={`adm-cat-parent__toggle ${expanded[cat.id] ? "open" : ""}`}
                onClick={() => toggleExpand(cat.id)}
                aria-label="Mở rộng"
              >
                <span className="adm-cat-parent__chevron">{expanded[cat.id] ? "▾" : "▸"}</span>
              </button>
              {cat.imageUrl || cat.image ? (
                <img
                  src={cat.imageUrl || cat.image}
                  alt={cat.name}
                  style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}
                />
              ) : (
                <span className="adm-cat-parent__icon">📁</span>
              )}
              <div className="adm-cat-parent__info">
                <strong>{cat.name}</strong>
                <small>{cat.children?.length ?? 0} danh mục con · {cat.productCount} sản phẩm</small>
              </div>
              <span className={`adm-cat-badge ${cat.status === "Hoạt động" ? "active" : "off"}`}>
                {cat.status}
              </span>
              <div className="adm-cat-parent__actions">
                <button type="button" className="act-edit" onClick={() => handleEditParent(cat)}>Sửa</button>
                <button type="button" className="act-add" onClick={() => { handleAddChild(cat.id); if (!expanded[cat.id]) toggleExpand(cat.id); }}>+ Con</button>
                <button type="button" className="act-toggle" onClick={() => handleToggleParent(cat)}>
                  {cat.status === "Hoạt động" ? "Tắt" : "Bật"}
                </button>
                <button type="button" className="act-delete" onClick={() => handleDeleteParent(cat)}>Xóa</button>
              </div>
            </div>

            {/* ── Children rows ── */}
            {expanded[cat.id] && (
              <div className="adm-cat-children">
                {(cat.children ?? []).length === 0 && (
                  <p className="adm-cat-children__empty">Chưa có danh mục con.</p>
                )}
                {(cat.children ?? []).map((child) => (
                  <div key={child.id} className={`adm-cat-child ${child.status !== "Hoạt động" ? "disabled" : ""}`}>
                    <span className="adm-cat-child__dot">└</span>
                    {child.imageUrl || child.image ? (
                      <img
                        src={child.imageUrl || child.image}
                        alt={child.name}
                        style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover', flexShrink: 0, marginRight: 8 }}
                      />
                    ) : null}
                    <div className="adm-cat-child__info">
                      <span>{child.name}</span>
                      <small>{child.productCount} sản phẩm</small>
                    </div>
                    <span className={`adm-cat-badge sm ${child.status === "Hoạt động" ? "active" : "off"}`}>
                      {child.status}
                    </span>
                    <div className="adm-cat-child__actions">
                      <button type="button" className="act-edit" onClick={() => handleEditChild(cat.id, child)}>Sửa</button>
                      <button type="button" className="act-toggle" onClick={() => handleToggleChild(cat.id, child)}>
                        {child.status === "Hoạt động" ? "Tắt" : "Bật"}
                      </button>
                      <button type="button" className="act-delete" onClick={() => handleDeleteChild(cat.id, child)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal thêm/sửa */}
      <AdminModal open={!!modal} title={modalTitle} onClose={() => setModal(null)}>
        <div className="adm-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Hình ảnh danh mục (Image)
            </span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                value={form.imageUrl || form.image || ""}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value, image: e.target.value })}
                placeholder="Nhập URL hình ảnh (https://...) hoặc chọn tệp tải ảnh..."
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#1f2937',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <label
                style={{
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  userSelect: 'none',
                  boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                📷 Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const url = ev.target?.result;
                        setForm((prev) => ({ ...prev, imageUrl: url, image: url }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            {(form.imageUrl || form.image) && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                <img
                  src={form.imageUrl || form.image}
                  alt="Preview"
                  style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>✓ Đã chọn hình ảnh</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "", image: "" })}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#dc2626',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: 'fit-content'
                    }}
                  >
                    ✕ Gỡ bỏ ảnh
                  </button>
                </div>
              </div>
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Tên danh mục <span style={{ color: '#ef4444' }}>*</span>
            </span>
            <input
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nhập tên danh mục..."
              autoFocus
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#1f2937',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Mô tả danh mục (Description)
            </span>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Nhập mô tả danh mục..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#1f2937",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                lineHeight: "1.5"
              }}
            />
          </label>
          {(modal === "add-parent" || modal === "edit-parent") && (
            <Select
              label="Trạng thái"
              value={form.status || "Hoạt động"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={CATEGORY_STATUS_OPTIONS}
            />
          )}
          {(modal === "add-child" || modal === "edit-child") && (
            <label>
              Danh mục cha
              <input
                value={list.filtered.find((c) => c.id === activeParentId)?.name ?? ""}
                disabled
                style={{ opacity: 0.6 }}
              />
            </label>
          )}
          <div className="adm-form__actions">
            <button type="button" className="cancel" onClick={() => setModal(null)}>Hủy</button>
            <button type="button" className="save" onClick={save} disabled={!form.name?.trim()}>Lưu</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export const AdminBrands = () => {
  const list = useAdminList(mockBrands, ["name"]);
  const [viewMode, setViewMode] = useState("grid");
  const [form, setForm] = useState(null);

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Thương hiệu" title="Quản lý thương hiệu" subtitle="CRUD thương hiệu sản phẩm." />
      <AdminToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        actions={[{ label: "+ Thêm thương hiệu", onClick: () => setForm({ name: "", status: "Hoạt động" }) }]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
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
      ) : (
        <div className="adm-list-container">
          {list.filtered.map((b) => (
            <div key={b.id} className="adm-list-row">
              <div className="adm-list-row__thumb">🏷️</div>
              <div className="adm-list-row__col adm-list-row__col--main">
                <strong className="adm-list-row__title">{b.name}</strong>
                <small className="adm-list-row__sub">Tạo ngày: {b.createdAt || "05/07/2026"}</small>
              </div>
              <div className="adm-list-row__col">
                <span className="adm-list-row__label">Số sản phẩm</span>
                <span className="adm-list-row__val highlight">{b.productCount || 0} SP</span>
              </div>
              <AdminStatusBadge status={b.status} />
              <div className="adm-list-row__actions">
                <button type="button" onClick={() => setForm({ ...b })}>Sửa</button>
                <button type="button" onClick={() => { const n = b.status === "Hoạt động" ? "Tắt" : "Hoạt động"; list.updateItem(b.id, { status: n }); toast.success("Đã cập nhật"); }}>
                  {b.status === "Hoạt động" ? "Tắt" : "Bật"}
                </button>
                <button type="button" className="danger" onClick={() => { list.removeItem(b.id); toast.info("Đã xóa"); }}>Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [viewMode, setViewMode] = useState("grid");
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminAnimatedView viewKey={sellerTab}>
        {sellerGroups.map(({ seller, items }) => (
          <SellerInventorySection
            key={seller}
            seller={seller}
            warehouse={getWarehouse(seller)}
            stats={calcInventoryStats(items, allProducts.filter((p) => p.seller === seller))}
            viewMode={viewMode}
          >
            {items.map((item) => (

              viewMode === "grid" ? (
                <InventoryGauge key={item.id} item={item} onSync={() => toast.success(`Đã đồng bộ ${item.sku}`)} />
              ) : (
                <div key={item.id} className="adm-list-row">
                  <div className="adm-list-row__thumb">📦</div>
                  <div className="adm-list-row__col adm-list-row__col--main">
                    <strong className="adm-list-row__title">{item.product}</strong>
                    <small className="adm-list-row__sub">SKU: {item.sku} · Seller: {item.seller}</small>
                  </div>
                  <div className="adm-list-row__col adm-list-row__col--qty">
                    <span className="adm-list-row__label">Số lượng tồn kho</span>
                    <span className="adm-list-row__val highlight">{item.stock} cái</span>
                  </div>
                  <div className="adm-list-row__col adm-list-row__col--threshold">
                    <span className="adm-list-row__label">Đã giữ / Ngưỡng</span>
                    <span className="adm-list-row__val">{item.reserved} / {item.threshold}</span>
                  </div>
                  <div className="adm-list-row__col adm-list-row__col--status">
                    <AdminStatusBadge status={item.status} />
                  </div>
                  <div className="adm-list-row__actions">
                    <button type="button" className="primary" onClick={() => toast.success(`Đã đồng bộ ${item.sku}`)}>Đồng bộ</button>
                  </div>
                </div>

              )
            ))}
          </SellerInventorySection>
        ))}
      </AdminAnimatedView>
    </div>
  );
};

