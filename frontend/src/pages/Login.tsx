/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  
return (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-pink-50 via-white to-rose-100 px-4 py-10">

    {/* Background Decorations */}
    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-rose-200/50 blur-3xl" />

    {/* Login Card */}
    <div className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-pink-200/40 backdrop-blur-xl sm:p-10">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#e23737] to-[#F45B91] shadow-lg shadow-pink-300/50">
          <span className="text-3xl font-extrabold text-white">T</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight  text-red-500">
          Tastora
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Delicious food, delivered with love.
        </p>
      </div>

      {/* Welcome */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome Back!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Log in or create your account to continue.
        </p>
      </div>

      {/* Google Login */}
      <button
        onClick={() => googleLogin()}
        disabled={loading}
        className="group flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:bg-pink-50 hover:shadow-lg hover:shadow-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FcGoogle size={23} />
        <span>
          {loading ? "Signing in..." : "Continue with Google"}
        </span>
      </button>

      {/* Divider */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Secure Login
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Footer */}
      <p className="text-center text-xs leading-6 text-gray-400">
        By continuing, you agree to our{" "}
        <a href="/terms" className="font-semibold text-[#E23774] hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="font-semibold text-[#E23774] hover:underline">
          Privacy Policy
        </a>.
      </p>

      <div className="mt-8 border-t border-gray-100 pt-5 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Tastora. All rights reserved.
        </p>
      </div>
    </div>
  </div>
);

};

export default Login;
