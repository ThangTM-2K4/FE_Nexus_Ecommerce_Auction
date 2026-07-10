import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthContext';
import * as orderService from '../../services/orderService';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      return;
    }
    setLoading(true);
    try {
      const data = await orderService.getOrders(user.id);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const createOrder = useCallback(
    async (orderData) => {
      if (!user?.id) return null;
      const order = await orderService.createOrder(user.id, orderData);
      await refreshOrders();
      return order;
    },
    [user?.id, refreshOrders],
  );

  const value = useMemo(
    () => ({
      orders,
      loading,
      createOrder,
      refreshOrders,
    }),
    [orders, loading, createOrder, refreshOrders],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}
