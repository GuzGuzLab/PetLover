// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts y Guards
import MainLayout from "./layout/MainLayout";
import Privado from "./services/privado"; // Guard para Admin y Veterinario
import UserLayout from "./layout/UserLayout"; // Layout para usuarios generales

// Módulos de Rutas
import PublicRoutes from "./routes/publicas.rutas.js"; 
import AdminRoutes from "./routes/admin.rutas.js";
import UserSpecificRoutes from "./routes/usuario.rutas.js";
import VeterinarioRoutes from "./routes/veterinario.rutas.js";

// Otros Componentes (si son globales a la App)
import CookieConsent from "./components/CookieConsent";

function App() {
  return (
    <BrowserRouter>
      <CookieConsent />
      <Routes>
        {/* Rutas públicas con MainLayout */}
        <Route element={<MainLayout />}>
          {PublicRoutes()}
        </Route>

        {/* Rutas protegidas por "Privado" (Admin y Veterinario) */}
        <Route element={<Privado />}>
          {AdminRoutes()}
          {VeterinarioRoutes()} {/* Rutas de veterinario ahora bajo Privado */}
        </Route>

        {/* Rutas con UserLayout para usuarios logueados */}
        <Route element={<UserLayout />}>
          {UserSpecificRoutes()}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;