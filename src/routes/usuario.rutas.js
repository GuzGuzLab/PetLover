import React from 'react';
import { Route } from 'react-router-dom';

// Importa tus componentes de Usuario
import UserWelcome from '../page/UserWelcome';
import DatosPro from '../page/Datospro';
import Ayudapro from '../page/ayudapro';
import Actualizarpro from '../page/Actualizarpro';
import MisMascotas from '../page/MisMascotas';
import AgendarCita from "../page/AgendarCita";
import CitasProximas from '../page/CitasProximas';
import HistorialMedico from '../page/HistorialMedico';
import Serviciopro from '../page/serviciopro';


const UserSpecificRoutes = () => (
  <>
    <Route path="/UserWelcome" element={<UserWelcome />} />
    <Route path="/Datospro" element={<DatosPro />} />
    <Route path="/Ayudapro" element={<Ayudapro />} />
    <Route path="/Actualizarpro" element={<Actualizarpro />} />
    <Route path= "/MisMascotas" element={<MisMascotas/>}/>
    <Route path="/MisMascotas" element={<MisMascotas />} />
    <Route path="/AgendarCita" element={<AgendarCita />} />
    <Route path="/CitasProximas" element={<CitasProximas />} /> 
    <Route path="/HistorialMedico" element={<HistorialMedico />} />
     <Route path="/serviciopro" element={<Serviciopro />} />
  </>
);

export default UserSpecificRoutes;

