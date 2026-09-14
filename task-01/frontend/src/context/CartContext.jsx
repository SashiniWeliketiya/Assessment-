import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const productId = product.id || product._id;
      const existingItemIndex = prevCart.findIndex(
        (item) => (item.id || item._id) === productId
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        const newQty = (Number(existingItem.quantity) || 1) + (Number(product.quantity) || 1);
        
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQty,
          expiresAt: new Date().getTime() + 5 * 60 * 1000 // Refresh 5-min timer
        };
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: Number(product.quantity) || 1,
            expiresAt: new Date().getTime() + 5 * 60 * 1000
          }
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => (item.id || item._id) !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id || item._id) === id
          ? { ...item, quantity: Math.max(1, Number(newQuantity) || 1) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);