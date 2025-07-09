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

  const handleLoginSuccess = (dataFromApi, isRoleBasedApi = false) => {
    let nombre = '';
    let userEmail = '';
    let rol = '';
    let doc = '';
    let redirectPath = '/UserWelcome';

    if (isRoleBasedApi) {
      const user = dataFromApi.usuario;
      if (user) {
        nombre = user.nombre;
        userEmail = user.email;
        rol = user.rol;
        doc = user.doc;
      }
      redirectPath = dataFromApi.redirect || redirectPath;
      localStorage.setItem('userId', user.id);
      if (user.nivel_acceso) localStorage.setItem('accessLevel', user.nivel_acceso);
      if (user.especialidad) localStorage.setItem('specialty', user.especialidad);
    } else {
      const user = dataFromApi.usuario;
      if (user) {
        nombre = user.nombre;
        userEmail = user.email;
        rol = user.rol || 'propietario';
        doc = user.doc;
        localStorage.setItem('userId', user.id);
      }
    }

    if (!nombre || !userEmail || !rol) {
      throw new Error('Datos de usuario incompletos o rol no definido tras el login.');
    }

    localStorage.setItem('nombre', nombre);
    localStorage.setItem('email', userEmail);
    if (doc) localStorage.setItem('doc_pro', doc);
    localStorage.setItem('rol', rol);

    setErrorGeneral('');
    setFailedAttempts(0);

    navigate(redirectPath);
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
    let response;
    let loginSuccessful = false;
  
    // 1. Intentar con la API original (propietario)
    try {
      console.log('Intentando login con la API original: /api/auth/login');
      response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (response.data && response.data.usuario) {
        handleLoginSuccess(response.data, false);
        loginSuccessful = true;
      }
    } catch (oldApiError) {
      console.warn('Error con la API antigua:', oldApiError.response?.data?.mensaje || oldApiError.message);
    }
  
    // 2. Intentar con la nueva API de propietarios
    if (!loginSuccessful) {
      try {
        console.log('Intentando login con la nueva API de propietarios: /api/autenticacion/login-propietario');
        response = await axios.post(`${API_BASE_URL}/api/autenticacion/login-propietario`, { email, password });
        if (response.data && response.data.usuario) {
          handleLoginSuccess(response.data, false);
          loginSuccessful = true;
        }
      } catch (propietarioError) {
        console.warn('Error con la API de propietarios:', propietarioError.response?.data?.message || propietarioError.message);
      }
    }
  
    // 3. Intentar con la API de veterinarios
    if (!loginSuccessful) {
      try {
        console.log('Intentando login como veterinario:/api/autenticacion/login-veterinario');
        response = await axios.post(`${API_BASE_URL}/api/autenticacion/login-veterinario`, { email, password });
        const { veterinario, usuario, redirect } = response.data;
      
        if (veterinario) {
          localStorage.setItem('vet_id', veterinario.vet_id);
          localStorage.setItem('especialidad', veterinario.especialidad);
          localStorage.setItem('registro_profesional', veterinario.registro_profesional);
        }
      
        handleLoginSuccess({ usuario, redirect }, true);
        loginSuccessful = true;
      } catch (vetApiError) {
        console.warn('Error con la API veterinaria:', vetApiError.response?.data?.message || vetApiError.message);
      }
    }

    // 4. Intentar con la API de administradores
    if (!loginSuccessful) {
      try {
        console.log('Intentando login como administrador:/api/autenticacion/login-admin');
        response = await axios.post(`${API_BASE_URL}/api/autenticacion/login-admin`, { email, password });
        const { administrador, usuario, redirect } = response.data;
      
        if (administrador) {
          localStorage.setItem('admin_id', administrador.admin_id);
          localStorage.setItem('nivel_acceso', administrador.nivel_acceso);
          localStorage.setItem('departamento', administrador.departamento);
        }
        handleLoginSuccess({ usuario, redirect }, true);
        loginSuccessful = true;
      } catch (adminApiError) {
        console.warn('Error con la API de administradores:', adminApiError.response?.data?.message || adminApiError.message);
      }
    }

    if (!loginSuccessful) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      if (attempts >= 3) {
        setIsBlocked(true);
        setCountdown(60);
        setErrorGeneral('Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
      } else {
        setErrorGeneral(`Credenciales incorrectas. Intentos restantes: ${3 - attempts}`);
      }
    }
  } catch (error) {
    console.error('Error inesperado durante el login:', error.message);
    setErrorGeneral('Error inesperado durante el inicio de sesión');
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
