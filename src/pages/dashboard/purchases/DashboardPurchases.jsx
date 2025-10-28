/**
 * Dashboard Purchases Page - View user's order history
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../services/api";
import { Card, Button, Loading } from "../../../components/common";
import { Package, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";

const DashboardPurchases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("completed"); // Default to completed only

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await api.get("/ventes/orders/", { params });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);

      // Check for authentication errors
      if (err.response?.status === 401) {
        toast.error("Please log in to view your purchases");
        navigate("/login");
      } else if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("Error loading purchases");
      }
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
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return labels[status] || status;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Purchases
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your order history and purchase details
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["completed", "cancelled", "all"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? "All Orders" : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Purchases Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't made any purchases yet
          </p>
          <Button onClick={() => navigate("/gallery")} variant="primary">
            Browse Gallery
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${parseFloat(order.total_price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.items?.length || 0} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {order.items?.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <img
                      src={
                        item.artwork?.primary_image || "/placeholder-art.jpg"
                      }
                      alt={item.artwork?.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                        {item.artwork?.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        by {item.artwork?.artist?.username}
                      </p>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      +{order.items.length - 3} more item
                      {order.items.length - 3 !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <Button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {orders.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Purchase Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {orders.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Orders
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {orders.filter((o) => o.status === "completed").length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                $
                {orders
                  .reduce((sum, o) => sum + parseFloat(o.total_price), 0)
                  .toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Spent
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPurchases;
