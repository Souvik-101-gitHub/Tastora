/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";

const Home = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  
if (loading || !location) {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-100 border-t-[#E23774]" />
      <p className="animate-pulse text-sm font-medium text-gray-500">
        Finding delicious restaurants near you...
      </p>
    </div>
  );
}

return (
  <main className="min-h-screen bg-gray-50/70">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Hero Section */}
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#e23737] to-[#f45b77] px-6 py-12 shadow-lg shadow-pink-200/40 sm:px-10 sm:py-16">

        <div className="relative z-10 max-w-xl">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-xs font-semibold tracking-wider text-white backdrop-blur">
            FOOD DELIVERY MADE EASY
          </span>

          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Delicious food,
            <br />
            delivered to your door.
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-white/85 sm:text-base">
            Discover the best restaurants around you and enjoy
            your favourite meals with Tastora.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#e23737] shadow-md">
            <span>Explore Restaurants</span>
            <span>→</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[30px] border-white/10" />
        <div className="absolute -bottom-24 right-28 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute bottom-8 right-10 hidden text-8xl opacity-90 lg:block">
          🍕
        </div>
        <div className="absolute right-44 top-10 hidden text-5xl opacity-80 lg:block">
          🍔
        </div>
      </section>

      {/* Restaurant Heading */}
      <section className="mb-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-500">
              Explore food
            </p>

            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {search
                ? `Results for "${search}"`
                : "Restaurants near you"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Discover delicious meals from nearby restaurants.
            </p>
          </div>

          <span className="rounded-full bg-pink-50 px-4 py-2 text-xs font-semibold  text-red-500">
            {restaurants.length} Restaurants
          </span>
        </div>
      </section>

      {/* Restaurant Grid */}
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((res) => {
            const [resLng, resLat] = res.autoLocation.coordinates;

            const distance = getDistanceKm(
              location.latitude,
              location.longitude,
              resLat,
              resLng
            );

            return (
              <div
                key={res._id}
                className="group transition duration-300 hover:-translate-y-1"
              >
                <RestaurantCard
                  id={res._id}
                  name={res.name}
                  image={res.image ?? ""}
                  distance={`${distance}`}
                  isOpen={res.isOpen}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-5 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-4xl">
            🍽️
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            No restaurants found
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
            {search
              ? "We couldn't find any restaurants matching your search. Try another name."
              : "There are no restaurants available near your location right now. Please check again later."}
          </p>
        </div>
      )}

      {/* Bottom Section */}
      <section className="mt-14 rounded-2xl border border-pink-100 bg-white p-6 text-center sm:p-8">
        <h3 className="text-lg font-bold text-gray-900">
          Good food brings happiness ❤️
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Discover your next favourite meal with Tastora.
        </p>
      </section>

    </div>
  </main>
);

};

export default Home;
