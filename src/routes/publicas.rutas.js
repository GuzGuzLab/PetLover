// src/routes/publicas.rutas.js
import React from 'react';
import { Route } from 'react-router-dom';

// Importa tus componentes públicos
import PagPrincipal from '../page/PagPrincipal';
import Login from '../page/Login';
import Citas from '../page/Citas';
import Servicios from '../page/Servicios';
import Propietarios from '../page/Propietarios';
import Ayuda from '../page/Ayuda';
import Mascotas from '../page/Mascotas';
import PoliticasP from '../page/PoliticasP';
import Ubicacion from '../page/Ubicacion';
import RecuperarContraseña from '../page/Recuperarcontraseña';
import Pacientes from '../page/Pacientes';
import Consultas from '../page/Consultas';
import HistorialMedico from '../page/HistorialMedico';
import Veterinarios from '../page/admin/Veterinarios';
import AyudaU from '../page/AyudaU';

const PublicRoutes = () => (
  <>
    <Route path="/" element={<PagPrincipal />} />
    <Route path="/login" element={<Login />} />
    <Route path="/citas" element={<Citas />} />
    <Route path="/servicios" element={<Servicios />} />
    <Route path="/propietarios" element={<Propietarios />} />
    <Route path="/ayuda" element={<Ayuda />} />
    <Route path="/mascotas" element={<Mascotas />} />
    <Route path="/PoliticasP" element={<PoliticasP />} />
    <Route path="/Ubicacion" element={<Ubicacion />} />
    <Route path="/Recuperarcontraseña" element={<RecuperarContraseña />} />
    <Route path="/Pacientes" element={<Pacientes />} />
    <Route path="/Consultas" element={<Consultas />} />
    <Route path="/HistorialMedico" element={<HistorialMedico />} />
    <Route path="/AyudaU" element={<AyudaU />} />
  </>
);

export default PublicRoutes;