// AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage      from "@/pages/auth/LoginPage";
import RegisterPage   from "@/pages/auth/RegisterPage";
import DashboardPage  from "@/pages/dashboard/DashboardPage";

import UsersPage      from "@/pages/users/UsersPage";
import CreateUserPage from "@/pages/users/CreateUserPage";

import LocationsPage from "@/pages/locations/LocationsPage";
import CreateLocationPage from "@/pages/locations/CreateLocationPage";
import EditLocationPage from "@/pages/locations/EditLocationPage";

import ProtectedRoute from "./ProtectedRoute";
import MainLayout     from "@/layouts/MainLayout";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas — sin dock */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Privadas — todas dentro de MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"    element={<DashboardPage />} />

          <Route path="/users"        element={<UsersPage />} />
          <Route path="/users/create" element={<CreateUserPage />} />

          <Route path="/locations"  element={<LocationsPage />} />
          <Route path="/locations/create" element={<CreateLocationPage />} />
          <Route path="/locations/edit/:id" element={<EditLocationPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;