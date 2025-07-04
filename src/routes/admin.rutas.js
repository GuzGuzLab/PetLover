// src/routes/admin.rutas.js
import React from 'react';
import { Route } from 'react-router-dom';

import FormularioUsu from '../page/admin/FormularioUsu';
import InicioAdmin from '../page/admin/InicioAdmin';
import MenuAdmin from '../page/admin/MenuAdmin';
import Admin from '../page/admin/Admin';
import Clientes from '../page/admin/Clientes';
import Roles from '../page/admin/Roles';
import Veterinarios from '../page/admin/Veterinarios';
import ServiciosAdmin from '../page/admin/ServiciosAdmin';
import Miperfil from '../page/admin/Miperfil';


const AdminRoutes = () => (
  <>
    <Route path="/FormularioUsu" element={<FormularioUsu />} />
    <Route path="/InicioAdmin" element={<InicioAdmin />} />
    <Route path="/MenuAdmin" element={<MenuAdmin />} />
    <Route path="/Admin" element={<Admin />} />
    <Route path="/Clientes" element={<Clientes />} />
    <Route path="/Roles" element={<Roles />} />
    <Route path="/Veterinarios" element={<Veterinarios />} />
    <Route path="/ServiciosAdmin" element={<ServiciosAdmin />} />
    <Route path="/Miperfil" element={<Miperfil />} />
  </>
);

export default AdminRoutes;


