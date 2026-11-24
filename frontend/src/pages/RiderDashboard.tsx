import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/faaah.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);

  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound Enabled");
    } catch (error) {
      toast.error("Tap again to enable sound");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data || null);
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailiblity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailble: !profile?.isAvailble,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(
          profile?.isAvailble ? "You are offline" : "You are online"
        );
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setToggling(false);
      }
    });
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();

      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());

      if (image) {
        formData.append("file", image);
      }

      try {
        const { data } = await axios.post(
          `${riderService}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(data.message);
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

 
if (user?.role !== "rider") {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#fafafa] px-4">
      <div className="rounded-2xl border border-gray-100 bg-white px-8 py-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-800">
          Rider Access Required
        </p>
        <p className="mt-2 text-sm text-gray-500">
          You are not registered as a rider.
        </p>
      </div>
    </div>
  );
}

if (loading) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#fafafa]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-[#E23774]" />
      <p className="text-sm font-medium text-gray-500">
        Loading rider details...
      </p>
    </div>
  );
}

if (!profile) {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E23774]">
            Tastora Delivery Partner
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
            Create Your Rider Profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Complete your details to get started with deliveries.
          </p>
        </div>

        <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Aadhaar Number
            </label>
            <input
              type="number"
              placeholder="Enter Aadhaar number"
              value={aadharNumber}
              onChange={(e) => setaadharNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#E23774] focus:bg-white focus:ring-4 focus:ring-pink-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Contact Number
            </label>
            <input
              type="number"
              placeholder="Enter contact number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#E23774] focus:bg-white focus:ring-4 focus:ring-pink-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Driving Licence
            </label>
            <input
              type="text"
              placeholder="Enter driving licence number"
              value={drivingLicenseNumber}
              onChange={(e) => setDrivingLicenseNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#E23774] focus:bg-white focus:ring-4 focus:ring-pink-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Profile Photo
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 transition hover:border-[#E23774] hover:bg-pink-50/40">
              <BiUpload className="h-6 w-6 text-[#E23774]" />
              <span className="min-w-0 flex-1 truncate">
                {image ? image.name : "Choose your profile image"}
              </span>
              <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#E23774] shadow-sm">
                Browse
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <button
            className="w-full rounded-xl bg-[#E23774] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#c92e65] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Create Rider Profile"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Please provide accurate information for verification.
          </p>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#fafafa] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Dashboard Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e7252c]">
            Tastora Delivery Partner
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Rider Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your availability and delivery orders.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              profile.isAvailble ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm font-semibold text-gray-700">
            {profile.isAvailble ? "Currently Online" : "Currently Offline"}
          </span>
        </div>
      </div>

      {/* Rider Profile */}
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-20 bg-gradient-to-r from-[#e2313f] to-red-400" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
              <img
                src={profile.picture}
                className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
                alt="Rider profile"
              />

              <div className="mt-15 sm:mb-2 sm:ml-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {profile.phoneNumber}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  profile.isVerified
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {profile.isVerified ? "✓ Verified" : "Verification Pending"}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  profile.isAvailble
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile.isAvailble ? "Online" : "Offline"}
              </span>
            </div>

            {/* Hotspot Information */}
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                Delivery Hotspot Information
              </p>
              <p className="mt-1 text-sm leading-6 text-blue-700">
                Please be within a 500 m radius of any restaurant (which we call a hotspot) before going online as a rider to receive orders.
              </p>
            </div>

            {/* Availability Button */}
            {profile.isVerified && !currentOrder && (
              <button
                onClick={toggleAvailiblity}
                disabled={toggling}
                className={`mt-5 w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:min-w-48 ${
                  toggling
                    ? "bg-gray-400"
                    : profile.isAvailble
                    ? "bg-gray-700 hover:bg-gray-800"
                    : "bg-[#e23737] hover:bg-[#e32330]"
                }`}
              >
                {toggling
                  ? "Updating..."
                  : profile.isAvailble
                  ? "Go Offline"
                  : "Go Online"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sound Notification */}
      {!audioUnlocked && (
        <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              🔔
            </span>
            <div>
              <p className="font-bold text-blue-900">
                Enable Sound Notifications
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Get notified when new delivery orders arrive.
              </p>
            </div>
          </div>

          <button
            onClick={unlockAudio}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Enable Sound
          </button>
        </div>
      )}

      {/* Incoming Orders */}
      {profile.isAvailble && incomingOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Incoming Orders
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                New delivery requests are waiting for you.
              </p>
            </div>

            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-[#E23774]">
              {incomingOrders.length} New
            </span>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {incomingOrders.map((id) => (
              <RiderOrderRequest
                key={id}
                orderId={id}
                onAccepted={() => {
                  fetchProfile();
                  fetchCurrentOrder();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Current Order */}
      {currentOrder && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Current Delivery
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your ongoing delivery.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <RiderCurrentOrder
                order={currentOrder}
                onStatusUpdate={fetchCurrentOrder}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-sm sm:p-4">
              <RiderOrderMap order={currentOrder} />
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
);

};

export default RiderDashboard;
