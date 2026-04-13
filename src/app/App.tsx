import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { AppProvider } from "./context/AppContext";
import { MobileFrame } from "./components/MobileFrame";
import { SplashScreen } from "./components/screens/SplashScreen";
import { LoginScreen } from "./components/screens/LoginScreen";
import { RegisterScreen } from "./components/screens/RegisterScreen";
import { ProfileSetupScreen } from "./components/screens/ProfileSetupScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { ExploreScreen } from "./components/screens/ExploreScreen";
import { RecommendationScreen } from "./components/screens/RecommendationScreen";
import { PartnerDetailScreen } from "./components/screens/PartnerDetailScreen";
import { ApplicationScreen } from "./components/screens/ApplicationScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { CatalogScreen } from "./components/screens/CatalogScreen";


function FrameWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <FrameWrapper>
        <SplashScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/login",
    element: (
      <FrameWrapper>
        <LoginScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/register",
    element: (
      <FrameWrapper>
        <RegisterScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/profile-setup",
    element: (
      <FrameWrapper>
        <ProfileSetupScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/app",
    element: <Navigate to="/app/home" replace />,
  },
  {
    path: "/app/home",
    element: (
      <FrameWrapper>
        <HomeScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/app/explore",
    element: (
      <FrameWrapper>
        <ExploreScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/app/explore/:id",
    element: (
      <FrameWrapper>
        <PartnerDetailScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/app/recommendation",
    element: (
      <FrameWrapper>
        <RecommendationScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/app/applications",
    element: (
      <FrameWrapper>
        <ApplicationScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/app/profile",
    element: (
      <FrameWrapper>
        <ProfileScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "/app/catalog",
    element: (
      <FrameWrapper>
        <CatalogScreen />
      </FrameWrapper>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}