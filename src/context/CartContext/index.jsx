import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../AuthContext';

const CartContext = createContext(null);

const storageKey = (userId) => `cart_${userId || 'guest'}`;

const loadCart = (userId) => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
};

const saveCart = (userId, items) => {
  localStorage.setItem(storageKey(userId), JSON.stringify(items));
};

const variantKey = (variant) => variant || '';

const mergeCartItems = (userItems, guestItems) => {
  const next = [...userItems];

  guestItems.forEach((guestItem) => {
    const match = next.find(
      (item) =>
        item.productId === guestItem.productId &&
        variantKey(item.variant) === variantKey(guestItem.variant),
    );

    if (match) {
      next.splice(next.indexOf(match), 1, {
        ...match,
        quantity: match.quantity + guestItem.quantity,
        selected: match.selected || guestItem.selected,
      });
      return;
    }

    next.push({
      ...guestItem,
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
  });

  return next;
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const prevUserIdRef = useRef(userId);
  const [cartItems, setCartItems] = useState(() => loadCart(userId));

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (!userId) {
      setCartItems(loadCart(null));
      return;
    }

    if (!prevUserId) {
      const guestItems = loadCart(null);
      const userItems = loadCart(userId);

      if (guestItems.length > 0) {
        const merged = mergeCartItems(userItems, guestItems);
        setCartItems(merged);
        saveCart(userId, merged);
        saveCart(null, []);
        return;
      }
    }

    setCartItems(loadCart(userId));
  }, [userId]);

  useEffect(() => {
    saveCart(userId, cartItems);
  }, [userId, cartItems]);

  const addToCart = useCallback((product, quantity, { selectOnly = false } = {}) => {
    setCartItems((prev) => {
      let next = [...prev];
      const match = next.find(
        (i) => i.productId === product.productId && variantKey(i.variant) === variantKey(product.variant),
      );
      let targetId;

      if (match) {
        targetId = match.id;
        next = next.map((i) =>
          i.id === match.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      } else {
        targetId = `cart-${Date.now()}`;
        next.push({
          id: targetId,
          shopId: product.shopId,
          shopName: product.shopName,
          productId: product.productId,
          name: product.name,
          image: product.image,
          variant: product.variant || '',
          price: product.price,
          quantity,
          selected: false,
        });
      }

      if (selectOnly) {
        next = next.map((i) => (i.id === targetId ? { ...i, selected: true } : i));
      }

      return next;
    });
  }, []);

  const buyNow = useCallback(
    (product, quantity) => {
      addToCart(product, quantity, { selectOnly: true });
    },
    [addToCart],
  );

  const updateQuantity = useCallback((itemId, quantity) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i)),
    );
  }, []);

  const removeItem = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const removeItems = useCallback((itemIds) => {
    const idSet = new Set(itemIds);
    setCartItems((prev) => prev.filter((i) => !idSet.has(i.id)));
  }, []);

  const toggleSelectItem = useCallback((itemId) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, selected: !i.selected } : i)),
    );
  }, []);

  const toggleSelectShop = useCallback((shopId, selected) => {
    setCartItems((prev) =>
      prev.map((i) => (i.shopId === shopId ? { ...i, selected } : i)),
    );
  }, []);

  const toggleSelectAll = useCallback((selected) => {
    setCartItems((prev) => prev.map((i) => ({ ...i, selected })));
  }, []);

  const getSelectedItems = useCallback(
    () => cartItems.filter((i) => i.selected),
    [cartItems],
  );

  const getTotalPrice = useCallback(() => {
    return cartItems
      .filter((i) => i.selected)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      addToCart,
      buyNow,
      updateQuantity,
      removeItem,
      removeItems,
      toggleSelectItem,
      toggleSelectShop,
      toggleSelectAll,
      getSelectedItems,
      getTotalPrice,
    }),
    [
      cartItems,
      cartCount,
      addToCart,
      buyNow,
      updateQuantity,
      removeItem,
      removeItems,
      toggleSelectItem,
      toggleSelectShop,
      toggleSelectAll,
      getSelectedItems,
      getTotalPrice,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
