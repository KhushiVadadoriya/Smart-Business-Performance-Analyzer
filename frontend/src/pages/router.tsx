import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../layout/AppShell";
import { RequireAuth } from "./RequireAuth";
import { LoginPage } from "./auth/LoginPage";
import { RegisterPage } from "./auth/RegisterPage";
import { DashboardPage } from "./dashboard/DashboardPage";
import { ProfilePage } from "./dashboard/ProfilePage";
import { AnalysisPage } from "./analysis/AnalysisPage";
import { AboutPage } from "./about/AboutPage";
import { HistoryPage } from "./history/HistoryPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "history", element: <HistoryPage /> },
    ],
  },
]);

