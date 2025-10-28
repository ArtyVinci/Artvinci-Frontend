/**
 * Cart Icon Component - Shows cart count badge
 * Icône du panier avec badge de comptage
 */

import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CartIcon = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <button
      onClick={() => navigate("/cart")}
      className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
      aria-label="Panier"
    >
      <ShoppingCart className="w-6 h-6" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
