import React from 'react';
import { LogOut } from 'lucide-react';

export default function HeaderVeterinario() {
  return (
    <header className="veterinario-header">
      <div className="veterinario-header-content">
        <div className="veterinario-logo-container">
          <img src="/logo.png" alt="Logo" className="veterinario-logo" />
          <h1 className="veterinario-title">Panel Veterinario</h1>
        </div>

        <div className="veterinario-user-section">
          <div className="veterinario-avatar-wrapper">
            <img src="/vet-avatar.jpg" alt="Veterinario" className="veterinario-avatar" />
            <div className="veterinario-user-info">
              <span className="veterinario-doctor-name">Dra. Mariana López</span>
              <span className="veterinario-role">Veterinaria</span>
            </div>
          </div>

          <div className="veterinario-logout">
            <button>
              <LogOut className="nav-icon" size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
