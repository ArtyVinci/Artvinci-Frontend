/**
 * Order Detail Page - View specific order details
 * Page de détails d'une commande
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    fetchOrderDetails();
  }, [orderId, user]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ventes/orders/${orderId}/`);
      setOrder(response.data);
    } catch (err) {
      console.error("Error fetching order:", err);
      toast.error("Erreur lors du chargement de la commande");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "En attente",
      completed: "Complétée",
      cancelled: "Annulée",
      refunded: "Remboursée",
    };
    return labels[status] || status;
  };

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Commande introuvable</p>
          <Button onClick={() => navigate("/orders")} variant="outline">
            Retour aux commandes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux commandes
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Commande #{order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                order.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Articles commandés
              </h2>

              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={
                        item.artwork?.primary_image || "/placeholder-art.jpg"
                      }
                      alt={item.artwork?.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {item.artwork?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        par {item.artwork?.artist?.username}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity}
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Information */}
            {(order.shipping_address || order.phone_number) && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de livraison
                </h2>

                {order.shipping_address && (
                  <div className="mb-4">
                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Adresse</p>
                        <p className="text-gray-600 whitespace-pre-line">
                          {order.shipping_address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order.phone_number && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-gray-600">{order.phone_number}</p>
                      </div>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium text-gray-700 mb-1">Notes</p>
                    <p className="text-gray-600">{order.notes}</p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>${parseFloat(order.total_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de service</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-purple-600">
                      ${parseFloat(order.total_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-3">Paiement</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode</span>
                    <span className="font-medium capitalize">
                      {order.payment_method}
                    </span>
                  </div>
                  {order.payment_intent_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Transaction</span>
                      <span className="font-mono text-xs">
                        {order.payment_intent_id.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                  {order.completed_at && (
                    <div className="flex items-center gap-2 mt-3 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Payé le{" "}
                        {new Date(order.completed_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Statut</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Commande créée</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  {order.status === "completed" && order.completed_at && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Paiement complété</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.completed_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.status === "pending" && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-sm">
                          En attente de paiement
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
