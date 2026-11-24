/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash } from "react-icons/bi";
// 🔧 Fix leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}
// 📍 Click-to-select location
const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};
// 🎯 Locate me button
const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied")
    );
  };
  return (
    <button
      onClick={locateUser}
      className="absolute right-3 top-3 z-1000 flex items-center gap-2
rounded-lg bg-white px-3 py-2 text-sm shadow hover:bg-gray-100"
    >
      <LuLocateFixed size={16} />
      Use current location
    </button>
  );
};
const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // 📋 Form state
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  // 🌍 Reverse geocoding
  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch {
      toast.error("Failed to fetch address");
    }
  };
  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };
  // 📡 Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses(data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAddresses();
  }, []);
  // ➕ Add address
  const addAddress = async () => {
    if (
      !mobile ||
      !formattedAddress ||
      latitude === null ||
      longitude === null
    ) {
      toast.error("Please select location on map");
      return;
    }
    try {
      setAdding(true);
      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress,
          mobile,
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Address added");
      setMobile("");
      setFormattedAddress("");

      setLatitude(null);
      setLongitude(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setAdding(false);
    }
  };
  // 🗑 Delete address
  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };
 
return (
  <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#e2374e]">
          Tastora Delivery
        </span>

        <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Manage Your Addresses
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Add your delivery location and get delicious food delivered to your doorstep.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">

        {/* Left: Add Address */}
        <section className="space-y-6 lg:col-span-3">

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-xl">
                📍
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Select Delivery Location
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Click anywhere on the map to select your location.
                </p>
              </div>
            </div>

            {/* Map */}
            <div className="relative h-[350px] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-inner sm:h-[420px]">
              <MapContainer
                center={[
                  latitude ?? 28.6139,
                  longitude ?? 77.209,
                ]}
                zoom={13}
                className="h-full w-full"
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <LocationPicker setLocation={setLocation} />
                <LocateMeButton onLocate={setLocation} />

                {latitude !== null && longitude !== null && (
                  <Marker position={[latitude, longitude]} />
                )}
              </MapContainer>
            </div>

            {/* Selected Location */}
            <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50/60 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">📌</span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#e2373f]">
                    Selected Location
                  </p>

                  <p className="mt-2 break-words text-sm leading-6 text-gray-700">
                    {formattedAddress ||
                      "Select a location on the map to see your address."}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Input */}
            <div className="mt-6 space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Mobile Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                placeholder="Enter your 10-digit mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#e23737] focus:bg-white focus:ring-4 focus:ring-red-100"
              />
            </div>

            {/* Save Button */}
            <button
              disabled={
                adding ||
                !mobile ||
                !formattedAddress ||
                latitude === null ||
                longitude === null
              }
              onClick={addAddress}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e93440] to-[#f45b68] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-red-300 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {adding ? (
                <BiLoader size={20} className="animate-spin" />
              ) : (
                <BiPlus size={20} />
              )}

              {adding ? "Saving Address..." : "Save Delivery Address"}
            </button>
          </div>
        </section>

        {/* Right: Saved Addresses */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Saved Addresses
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Your delivery locations
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-[#e23748]">
                {addresses.length} Saved
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <BiLoader size={30} className="animate-spin text-[#e23737]" />
                <p className="mt-3 text-sm text-gray-400">
                  Loading addresses...
                </p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center">
                <div className="mb-4 text-5xl">🏠</div>

                <h3 className="font-bold text-gray-800">
                  No addresses yet
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Select a location on the map and save your first delivery address.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="group rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition duration-200 hover:border-red-200 hover:bg-red-50/40"
                  >
                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                        🏠
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800">
                          Delivery Address
                        </p>

                        <p className="mt-2 break-words text-xs leading-5 text-gray-500">
                          {addr.formattedAddress}
                        </p>

                        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-600">
                          <span>📞</span>
                          {addr.mobile}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteAddress(addr._id)}
                        disabled={deletingId === addr._id}
                        title="Delete address"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        {deletingId === addr._id ? (
                          <BiLoader size={18} className="animate-spin" />
                        ) : (
                          <BiTrash size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Info */}
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛵</span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Fast & Fresh Delivery
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Save your address for a smoother checkout experience.
                </p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  </main>
);

};

export default AddAddressPage;
