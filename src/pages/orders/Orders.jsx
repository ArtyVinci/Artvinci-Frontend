/**
 * Orders Page - View user's order history
 * Page des commandes de l'utilisateur
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    fetchOrders();
  }, [user, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await api.get("/ventes/orders/", { params });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mes Commandes
          </h1>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status === "all" ? "Toutes" : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucune commande
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore passé de commande
            </p>
            <Button onClick={() => navigate("/gallery")} variant="primary">
              Découvrir la galerie
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <h3 className="text-xl font-bold text-gray-900">
                        Commande #{order.id.slice(0, 8)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      ${parseFloat(order.total_price).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0}{" "}
                      {order.items?.length > 1 ? "articles" : "article"}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={
                          item.artwork?.primary_image || "/placeholder-art.jpg"
                        }
                        alt={item.artwork?.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.artwork?.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          par {item.artwork?.artist?.username}
                        </p>
                        <p className="text-sm font-medium text-purple-600">
                          ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    variant="outline"
                    size="sm"
                  >
                    Voir les détails
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
