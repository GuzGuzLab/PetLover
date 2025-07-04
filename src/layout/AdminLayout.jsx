import React from 'react';
import MenuAdmin from '../page/admin/MenuAdmin';
import "../styles/Administrador/AdminLayout.css"

function AdminLayout({ children }) {
  return (
    <div className="admin-layout-container">
      <MenuAdmin>
        <div className="admin-content-wrapper">
          {children}
        </div>
      </MenuAdmin>
    </div>
  );
}

export default AdminLayout;