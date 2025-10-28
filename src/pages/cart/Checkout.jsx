/**
 * Checkout Page - Payment processing with Stripe
 * Page de paiement
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

// Stripe will be initialized with publishable key from backend
let stripePromise = null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  // Shipping information
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      // Prepare order items
      const items = cartItems.map((item) => ({
        artwork_id: item.id,
        quantity: item.quantity,
      }));

      const response = await api.post("/ventes/create-payment-intent/", {
        items,
        shipping_address: shippingInfo.address,
        phone_number: shippingInfo.phone,
        notes: shippingInfo.notes,
      });

      setClientSecret(response.data.clientSecret);
      setOrderId(response.data.order.id);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      toast.error(
        err.response?.data?.error || "Erreur lors de la création du paiement"
      );
      setError("Impossible de créer le paiement. Veuillez réessayer.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user.username,
            email: user.email,
          },
        },
      });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      toast.error(stripeError.message);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      // Confirm payment with backend
      try {
        await api.post("/ventes/confirm-payment/", {
          payment_intent_id: paymentIntent.id,
        });

        setSucceeded(true);
        setProcessing(false);
        toast.success("Paiement réussi !");

        // Clear cart
        clearCart();

        // Redirect to success page
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 2000);
      } catch (err) {
        console.error("Error confirming payment:", err);
        setError(
          "Paiement réussi mais erreur de confirmation. Contactez le support."
        );
        setProcessing(false);
      }
    }
  };

  const handleChange = (event) => {
    setError(event.error ? event.error.message : "");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Informations de livraison
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse de livraison
            </label>
            <textarea
              value={shippingInfo.address}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
              placeholder="Votre adresse complète"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={shippingInfo.phone}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={shippingInfo.notes}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="2"
              placeholder="Instructions spéciales..."
            />
          </div>
        </div>
      </Card>

      {/* Payment Information */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Informations de paiement
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carte bancaire
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Lock className="w-4 h-4 text-green-500" />
          <span>Paiement sécurisé par Stripe</span>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!stripe || processing || succeeded}
      >
        {processing
          ? "Traitement en cours..."
          : succeeded
          ? "Paiement réussi ✓"
          : `Payer $${getCartTotal().toFixed(2)}`}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal } = useCart();
  const [stripeKey, setStripeKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      toast.error("Veuillez vous connecter");
      navigate("/auth/login");
      return;
    }

    // Redirect if cart is empty
    if (cartItems.length === 0) {
      toast.error("Votre panier est vide");
      navigate("/gallery");
      return;
    }

    // Get Stripe publishable key from backend
    const fetchStripeConfig = async () => {
      try {
        const response = await api.get("/ventes/config/");
        setStripeKey(response.data.publishableKey);
        stripePromise = loadStripe(response.data.publishableKey);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Stripe config:", err);
        toast.error("Erreur de configuration du paiement");
        setLoading(false);
      }
    };

    fetchStripeConfig();
  }, [user, cartItems, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!stripeKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">
            Erreur de configuration du paiement
          </p>
          <Button onClick={() => navigate("/cart")} variant="outline">
            Retour au panier
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au panier
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Paiement</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Récapitulatif
              </h3>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-gray-500">Qté: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-purple-600">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
