import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";

export const authService = "https://tastora-auth.onrender.com";
export const restaurantService = "https://tastora-restaurant.onrender.com";
export const utilsService = "https://tastora-utils.onrender.com";
export const realtimeService = "https://tastora-realtime-latest.onrender.com";
export const riderService = "https://tastora-rider.onrender.com";
export const adminService = "https://tastora-admin.onrender.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="778024086847-vnkpaq9bsui64gkg3b46ghl4faaq8kl3.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
