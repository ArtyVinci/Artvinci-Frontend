/**
 * Cart Context - Manage shopping cart state
 * Panier pour gérer les œuvres avant l'achat
 */

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Load cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("artvinciCart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("artvinciCart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (artwork, quantity = 1) => {
    setCartItems((prevItems) => {
      // Check if artwork already in cart
      const existingItem = prevItems.find((item) => item.id === artwork.id);

      if (existingItem) {
        // Update quantity
        return prevItems.map((item) =>
          item.id === artwork.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { ...artwork, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (artworkId) => {
    setCartItems((prevItems) => {
      return prevItems.filter((item) => item.id !== artworkId);
    });
  };

  // Update item quantity
  const updateQuantity = (artworkId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(artworkId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === artworkId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Check if item is in cart
  const isInCart = (artworkId) => {
    return cartItems.some((item) => item.id === artworkId);
  };

  // Get item quantity
  const getItemQuantity = (artworkId) => {
    const item = cartItems.find((item) => item.id === artworkId);
    return item ? item.quantity : 0;
  };

  // Calculate total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.price || 0) * item.quantity;
    }, 0);
  };

  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
