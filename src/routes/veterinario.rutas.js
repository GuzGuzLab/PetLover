// src/routes/veterinario.rutas.js

import React from 'react';
import { Route } from 'react-router-dom';

// Importa tus componentes de Veterinario
import VeterinarioPer from '../page/VeterinarioPer';
import VetMascotas from '../page/VetMascotas';
import ConsultasVet from '../page/ConsultasVet';
import CitasVet from '../page/CitasVet';
import UsuarioVet from '../page/UsuarioVet';
// No es necesario importar 'Citas' aquí porque no tiene una ruta propia en este layout

const VeterinarioRoutes = () => (
  <>
    <Route path="/VeterinarioPer" element={<VeterinarioPer />} />
    <Route path="/VetMascotas" element={<VetMascotas />} />
    <Route path="/ConsultasVet" element={<ConsultasVet />} />
    <Route path="/CitasVet" element={<CitasVet />} />
    <Route path="/UsuarioVet" element={<UsuarioVet />} />
  </>
);

export default VeterinarioRoutes;