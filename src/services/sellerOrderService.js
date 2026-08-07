import api from '../config/api';
import { unwrapData, unwrapPagedList } from '../utils/apiResponse';

/**
 * Maps backend SellerOrderSummaryResponse or SellerOrderDetailResponse into UI-compatible order object.
 */
export function mapSellerOrderToUi(order) {
  if (!order) return null;

  // Handle items array
  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0] || {};

  const orderId = order.orderId || order.id || order.orderNumber || '—';
  const displayId = order.orderNumber || orderId;

  // Format date: ISO date string to "DD/MM/YYYY HH:mm"
  let dateStr = '—';
  if (order.createdAt) {
    try {
      const d = new Date(order.createdAt);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      dateStr = `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      dateStr = String(order.createdAt);
    }
  }

  // Normalize status string (e.g. PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED, REFUNDED)
  let statusNorm = 'Pending';
  const st = String(order.status || '').toUpperCase();
  if (st.includes('CANCEL')) statusNorm = 'Cancelled';
  else if (st.includes('REFUND')) statusNorm = 'Refunded';
  else if (st.includes('DELIVER') || st.includes('COMPLET')) statusNorm = 'Completed';
  else if (st.includes('SHIP')) statusNorm = 'Shipping';
  else if (st.includes('AWAIT') || st.includes('PICKUP')) statusNorm = 'AwaitingPickup';
  else if (st.includes('CONFIRM')) statusNorm = 'Confirmed';
  else if (st.includes('PEND') || st.includes('PAY')) statusNorm = 'Pending';

  // Customer info from destination / order
  const dest = order.destination || {};
  const customerName = dest.recipientName || order.buyerName || order.customer || 'Khách hàng';
  const customerPhone = dest.phoneNumber || dest.phone || order.phone || '';
  const customerAddress = [dest.addressLine1, dest.addressLine2, dest.ward, dest.district, dest.city]
    .filter(Boolean)
    .join(', ') || order.address || '';

  const productName = firstItem.productName || (items.length > 1 ? `${firstItem.productName || 'Sản phẩm'} và ${items.length - 1} sản phẩm khác` : 'Sản phẩm');
  const productImage = firstItem.productImageUrl || firstItem.image || '/images/auction/iphone.jpg';

  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || order.qty || 1;

  return {
    id: displayId,
    rawId: orderId,
    customer: customerName,
    phone: customerPhone,
    address: customerAddress,
    product: productName,
    image: productImage,
    qty: totalQty,
    amount: Number(order.totalAmount ?? order.amount ?? 0),
    shippingFee: Number(order.shippingFee ?? 0),
    carrier: order.carrier || 'ghn',
    tracking: order.trackingNumber || order.tracking || '—',
    status: statusNorm,
    rawStatus: order.status,
    date: dateStr,
    items: items.map((it) => ({
      id: it.orderItemId || it.id,
      name: it.productName || 'Sản phẩm',
      variant: it.skuName || '',
      image: it.productImageUrl || productImage,
      price: Number(it.unitPrice || 0),
      quantity: Number(it.quantity || 1),
    })),
  };
}

/**
 * Fetch list of seller orders from API — GET /api/v1/seller/orders
 */
export async function getSellerOrders(params = {}) {
  try {
    const { data } = await api.get('/seller/orders', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 50,
        status: params.status || undefined,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
        sortBy: params.sortBy || undefined,
        sortDirection: params.sortDirection || undefined,
      },
      skipErrorRedirect: true,
    });

    const pagedData = unwrapPagedList(data);
    const rawItems = pagedData.items || pagedData.content || (Array.isArray(unwrapData(data)) ? unwrapData(data) : []);
    
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      return rawItems.map(mapSellerOrderToUi);
    }
    return [];
  } catch (err) {
    console.warn('Failed to fetch seller orders from API:', err?.message);
    return null;
  }
}

/**
 * Fetch detail of a seller order — GET /api/v1/seller/orders/{orderId}
 */
export async function getSellerOrderDetail(orderId) {
  try {
    const { data } = await api.get(`/seller/orders/${orderId}`, { skipErrorRedirect: true });
    const result = unwrapData(data);
    return mapSellerOrderToUi(result);
  } catch (err) {
    console.warn(`Failed to fetch seller order detail for ${orderId}:`, err?.message);
    return null;
  }
}

/**
 * Confirm a seller order — POST /api/v1/seller/orders/{orderId}/confirm
 */
export async function confirmSellerOrder(orderId) {
  const { data } = await api.post(`/seller/orders/${orderId}/confirm`, {}, { skipErrorRedirect: true });
  return unwrapData(data);
}

/**
 * Reject a seller order — POST /api/v1/seller/orders/{orderId}/reject
 */
export async function rejectSellerOrder(orderId, reason) {
  const { data } = await api.post(`/seller/orders/${orderId}/reject`, { reason }, { skipErrorRedirect: true });
  return unwrapData(data);
}
