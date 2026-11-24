/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import { BiLoader, BiPackage, BiRightArrowAlt } from "react-icons/bi";
import { FiClock, FiCheckCircle, FiShoppingBag } from "react-icons/fi";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/myorder`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  const activeOrders = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status)
  );

  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status)
  );

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center">
        <BiLoader className="animate-spin text-[#e23748]" size={40} />
        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e23742]">
            Tastora
          </span>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track your orders and view your delicious food history.
          </p>
        </div>

        {/* Order Summary */}
        <div className="mb-9 grid grid-cols-2 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#e23745]">
              <FiShoppingBag size={20} />
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              {orders.length}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500">
              Total Orders
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <FiClock size={20} />
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              {activeOrders.length}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500">
              Active Orders
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiCheckCircle size={20} />
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              {completedOrders.length}
            </p>

            <p className="mt-1 text-xs font-medium text-gray-500">
              Other Orders
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Active Orders
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Your ongoing food deliveries
              </p>
            </div>

            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-[#e22f44]">
              {activeOrders.length} Active
            </span>
          </div>

          {activeOrders.length === 0 ? (
            <EmptyOrders
              title="No active orders"
              description="You don't have any ongoing orders right now."
              icon="🛵"
            />
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onClick={() => navigate(`/order/${order._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed Orders */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Order History
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Your previous orders
            </p>
          </div>

          {completedOrders.length === 0 ? (
            <EmptyOrders
              title="No order history"
              description="Your completed and cancelled orders will appear here."
              icon="📦"
            />
          ) : (
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onClick={() => navigate(`/order/${order._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#e2373f] to-[#f75164] p-6 text-center text-white shadow-lg shadow-red-200/40">
          <h3 className="text-lg font-bold">
            Craving something delicious? ❤️
          </h3>
          <p className="mt-2 text-sm text-white/85">
            Discover amazing food and order your favourites with Tastora.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-5 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#e23745] transition hover:bg-red-50"
          >
            Explore Restaurants
          </button>
        </div>

      </div>
    </main>
  );
};

export default Orders;

// Empty Orders Component
const EmptyOrders = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
      <div className="mb-4 text-5xl">{icon}</div>

      <h3 className="font-bold text-gray-800">{title}</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
};

// Order Row Component
const OrderRow = ({
  order,
  onClick,
}: {
  order: IOrder;
  onClick: () => void;
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-50 text-blue-600";

      case "accepted":
        return "bg-indigo-50 text-indigo-600";

      case "preparing":
        return "bg-orange-50 text-orange-600";

      case "ready_for_rider":
        return "bg-purple-50 text-purple-600";

      case "rider_assigned":
        return "bg-cyan-50 text-cyan-600";

      case "picked_up":
        return "bg-pink-50 text-[#E23774]";

      case "delivered":
        return "bg-green-50 text-green-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatStatus = (status: string) =>
    status.replace(/_/g, " ");

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 sm:p-6"
    >
      {/* Top Section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-[#d62a41]">
            <BiPackage size={24} />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900">
              Order #{order._id.slice(-6).toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Tastora Order
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(order.status)}`}
        >
          {formatStatus(order.status)}
        </span>
      </div>

      {/* Items */}
      <div className="my-5 border-y border-gray-100 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Order Items
        </p>

        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="flex justify-between gap-3 text-sm"
            >
              <span className="text-gray-600">
                {item.name}
              </span>

              <span className="shrink-0 font-semibold text-gray-800">
                × {item.quauntity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Total Amount</p>
          <p className="mt-1 text-xl font-extrabold text-gray-900">
            ₹{order.totalAmount}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="flex items-center gap-2 rounded-xl bg-[#e23742] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#c92d3f] sm:text-sm"
        >
          Track Order
          <BiRightArrowAlt size={19} />
        </button>
      </div>
    </div>
  );
};
