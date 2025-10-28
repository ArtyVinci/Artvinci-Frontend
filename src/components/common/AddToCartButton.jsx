/**
 * Add to Cart Button Component
 * Bouton pour ajouter une œuvre au panier
 */

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Button from "./Button";

const AddToCartButton = ({
  artwork,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if artwork is available
    if (!artwork.available || artwork.status === "sold") {
      return;
    }

    addToCart(artwork);

    // Show "Added" feedback (notification is handled by CartContext)
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleGoToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/cart");
  };

  const inCart = isInCart(artwork.id);
  const quantity = getItemQuantity(artwork.id);

  // Don't show button if artwork is not available
  if (!artwork.available || artwork.status === "sold") {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        Not Available
      </Button>
    );
  }

  if (justAdded) {
    return (
      <Button variant="success" size={size} className={className} disabled>
        <Check className="w-5 h-5 mr-2" />
        Added to Cart
      </Button>
    );
  }

  // If item is in cart, show "In Cart" button that navigates to cart
  if (inCart) {
    return (
      <Button
        onClick={handleGoToCart}
        variant="outline"
        size={size}
        className={className}
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        In Cart ({quantity})
      </Button>
    );
  }

  // Otherwise show "Add to Cart" button
  return (
    <Button
      onClick={handleAddToCart}
      variant={variant}
      size={size}
      className={className}
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;
