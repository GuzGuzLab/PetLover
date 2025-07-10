import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE_URL = "http://localhost:3000";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isBlocked && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && isBlocked) {
      setIsBlocked(false);
      setFailedAttempts(0);
      setErrorGeneral('');
    }
    return () => clearTimeout(timer);
  }, [isBlocked, countdown]);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const valor = e.target.value.toLowerCase();
    setEmail(valor);
    if (!validarEmail(valor)) {
      setEmailError('Correo electrónico inválido');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) return;

    if (!email || !password) {
      setErrorGeneral('Por favor completa ambos campos');
      return;
    }

    if (emailError) {
      setErrorGeneral('Por favor corrige el correo electrónico');
      return;
    }

    setIsLoading(true);
    setErrorGeneral('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/autenticacion/login`, {
        email,
        password,
      });

      const data = response.data;
      const user = data.usuario;

      if (!user || !user.rol) {
        throw new Error('Datos incompletos o sin rol.');
      }

      localStorage.setItem('userId', user.id);
      localStorage.setItem('nombre', user.nombre);
      localStorage.setItem('email', user.email);
      localStorage.setItem('doc_pro', user.doc);
      localStorage.setItem('rol', user.rol);

      if (data.veterinario) {
        localStorage.setItem('vet_id', data.veterinario.vet_id);
        localStorage.setItem('especialidad', data.veterinario.especialidad);
        localStorage.setItem('registro_profesional', data.veterinario.registro_profesional);
      }

      if (data.administrador) {
        localStorage.setItem('admin_id', data.administrador.admin_id);
        localStorage.setItem('nivel_acceso', data.administrador.nivel_acceso);
        localStorage.setItem('departamento', data.administrador.departamento);
      }

      setErrorGeneral('');
      setFailedAttempts(0);

      navigate(data.redirect || '/UserWelcome');

    } catch (error) {
      console.error('❌ Error durante login:', error.message);
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 3) {
        setIsBlocked(true);
        setCountdown(60);
        setErrorGeneral('Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
      } else if (error.response?.status === 401) {
        setErrorGeneral(`Credenciales incorrectas. Intentos restantes: ${3 - attempts}`);
      } else {
        setErrorGeneral('Error en el servidor o inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`login-container ${isBlocked ? 'blurred-background' : ''}`}>
      {isBlocked && (
        <div className="countdown-overlay">
          <div className="countdown-modal">
            <h2>Cuenta Bloqueada Temporalmente</h2>
            <p>Demasiados intentos fallidos. Por favor espere:</p>
            <div className="countdown-number">{countdown}</div>
            <p>segundos para volver a intentar</p>
          </div>
        </div>
      )}

      <div className="login-box login-image-side">
        <img
          src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/inicio.png"
          alt="Mascotas felices"
          className="login-image"
        />
      </div>

      <div className="login-box login-form-side">
        <h2>🐾 Pets-Lovers</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico:</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="ejemplo@vet.com"
              autoComplete="username"
              disabled={isBlocked || isLoading}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isBlocked || isLoading}
              />
              <span
                className="password-toggle-icon"
                onClick={() => !isBlocked && !isLoading && setShowPassword(!showPassword)}
                style={{ cursor: isBlocked || isLoading ? 'not-allowed' : 'pointer' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {errorGeneral && <p className="error-message">{errorGeneral}</p>}

          <button
            type="submit"
            disabled={isBlocked || isLoading}
            className={`login-button ${isBlocked ? 'blocked-button' : ''} ${isLoading ? 'loading-button' : ''}`}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : isBlocked ? (
              'CUENTA BLOQUEADA'
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-links">
          <Link to="/Recuperarcontraseña">¿Olvidaste tu contraseña?</Link>
          <Link to="/Propietarios">Registrar</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
