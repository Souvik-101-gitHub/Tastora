import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";

const Admin = () => {
  const [restaurant, setRestaurant] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${adminService}/api/v1/admin/restaurant/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const response = await axios.get(
        `${adminService}/api/v1/admin/rider/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurants);
      setRiders(response.data.riders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
if (loading) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#fafafa]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-[#e23737]" />
      <p className="text-sm font-medium text-gray-500">
        Loading admin dashboard...
      </p>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#fafafa] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-7">

      {/* Dashboard Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e52933]">
            Tastora Administration
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage restaurant and rider verification requests.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-700">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Restaurants
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                {restaurant.length}
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Awaiting verification
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-xl">
              🏪
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Riders
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                {riders.length}
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Awaiting verification
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🛵
            </div>
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Tabs */}
        <div className="border-b border-gray-100 px-4 pt-5 sm:px-6">
          <h2 className="text-lg font-bold text-gray-900">
            Verification Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review applications and verify registered partners.
          </p>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setTab("restaurant")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition sm:flex-none sm:px-6 ${
                tab === "restaurant"
                  ? "border-[#e23737] bg-pink-50/60 text-[#ed292c]"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              Restaurants
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                tab === "restaurant"
                  ? "bg-pink-100 text-[#de3036]"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {restaurant.length}
              </span>
            </button>

            <button
              onClick={() => setTab("rider")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition sm:flex-none sm:px-6 ${
                tab === "rider"
                  ? "border-[#e23751] bg-red-50/60 text-[#e23745]"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              Riders
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                tab === "rider"
                  ? "bg-red-100 text-[#e2373f]"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {riders.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">

          {tab === "restaurant" && (
            <div>
              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900">
                  Restaurant Applications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review pending restaurant registrations.
                </p>
              </div>

              {restaurant.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
                  <span className="text-4xl">🏪</span>
                  <h3 className="mt-3 font-bold text-gray-800">
                    No Pending Restaurants
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All restaurant applications have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {restaurant.map((r) => (
                    <AdminRestaurantCard
                      key={r._id}
                      restaurant={r}
                      onVerify={fetchData}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "rider" && (
            <div>
              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900">
                  Rider Applications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review pending delivery partner registrations.
                </p>
              </div>

              {riders.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
                  <span className="text-4xl">🛵</span>
                  <h3 className="mt-3 font-bold text-gray-800">
                    No Pending Riders
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All rider applications have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {riders.map((r) => (
                    <RiderAdmin
                      key={r._id}
                      rider={r}
                      onVerify={fetchData}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  </div>
);

};

export default Admin;
