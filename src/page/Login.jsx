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

  // Efecto para el contador de bloqueo de cuenta
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

  // Función para validar el formato del correo electrónico
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Manejador de cambio para el campo de email
  const handleEmailChange = (e) => {
    const valor = e.target.value.toLowerCase();
    setEmail(valor);

    if (!validarEmail(valor)) {
      setEmailError('Correo electrónico inválido');
    } else {
      setEmailError('');
    }
  };

  // --- Función central para manejar el éxito del login desde ambas APIs ---
  const handleLoginSuccess = (dataFromApi, isRoleBasedApi = false) => {
    let nombre = '';
    let userEmail = '';
    let rol = '';
    let doc = '';
    let redirectPath = '/UserWelcome'; // Ruta de redirección por defecto

    if (isRoleBasedApi) {
      // Si la respuesta viene de la API '/login_con_roles'
      const user = dataFromApi.usuario; // La nueva API encapsula los datos del usuario en 'usuario'
      if (user) {
        nombre = user.nombre;
        userEmail = user.email;
        rol = user.rol;
        doc = user.doc;
      }
      redirectPath = dataFromApi.redirect || redirectPath; // Usa la redirección que envía la nueva API
      localStorage.setItem('userId', dataFromApi.usuario.id); // Guarda el ID de usuario de la nueva API

      // Guarda datos específicos del rol si la API los envía
      if (dataFromApi.usuario.nivel_acceso) localStorage.setItem('accessLevel', dataFromApi.usuario.nivel_acceso);
      if (dataFromApi.usuario.especialidad) localStorage.setItem('specialty', dataFromApi.usuario.especialidad);

    } else {
      // Si la respuesta viene de la API original '/login'
      const user = dataFromApi.usuario;
      if (user) {
        nombre = user.nombre;
        userEmail = user.email;
        rol = user.rol || 'propietario'; // Si la API original no envía 'rol', asumimos 'propietario'
        doc = user.doc;
        localStorage.setItem('userId', user.id); // Guarda el ID de usuario si la API original lo proporciona
      }
      // La API original probablemente no envía una ruta de redirección específica, se asume por defecto
      redirectPath = '/UserWelcome'; 
    }

    // Asegurarse de que los datos esenciales estén presentes
    if (!nombre || !userEmail || !rol) {
      throw new Error('Datos de usuario incompletos o rol no definido tras el login.');
    }

    // Guardar información en localStorage para acceso global en la aplicación
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('email', userEmail);
    if (doc) localStorage.setItem('doc_pro', doc);
    localStorage.setItem('rol', rol); // Siempre guarda el rol determinado

    // Limpiar errores y contador de intentos fallidos
    setErrorGeneral('');
    setFailedAttempts(0);

    // Redirigir al usuario
    navigate(redirectPath);
  };

  // --- Función para manejar el envío del formulario de login ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) return; // No permitir login si la cuenta está bloqueada
    if (!email || !password) {
      setErrorGeneral('Por favor completa ambos campos');
      return;
    }
    if (emailError) {
      setErrorGeneral('Por favor corrige el correo electrónico');
      return;
    }

    setIsLoading(true); // Mostrar spinner de carga
    setErrorGeneral(''); // Limpiar errores anteriores

    try {
      let response;
      let loginSuccessful = false; // Bandera para controlar si el login ya fue exitoso

      // 1. Intento con la API original (ej. para login de propietarios específicos)
      try {
        console.log('Intentando login con la API original: /api/auth/login');
        response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email,
          password,
        });
        
        // Si la API original tiene éxito y devuelve un usuario válido
        if (response.data && response.data.usuario) {
            handleLoginSuccess(response.data, false); // 'false' indica que es la API original
            loginSuccessful = true; // Marcar como exitoso
        }
      } catch (oldApiError) {
        // Este catch maneja errores específicos de la primera API (ej. 401 Unauthorized)
        console.warn('Error con la API antigua o usuario no encontrado allí:', oldApiError.response?.data?.mensaje || oldApiError.message);
        // No hacemos nada más aquí, simplemente dejamos que el flujo continúe al siguiente intento.
      }

      // 2. Si el login no fue exitoso con la primera API, intentar con la nueva API basada en roles
      if (!loginSuccessful) {
        console.log('Intentando login con la nueva API de roles: /api/auth/login_con_roles');
        response = await axios.post(`${API_BASE_URL}/api/auth/login_con_roles`, {
          email,
          password,
        });
        handleLoginSuccess(response.data, true); // 'true' indica que es la API de roles
        loginSuccessful = true; // Marcar como exitoso
      }
      
    } catch (error) {
      // Este catch capturará errores si AMBAS APIs fallan o si hay un error inesperado
      console.error('Error durante el intento de login:', error.response?.data || error.message);
      
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      
      if (attempts >= 3) {
        setIsBlocked(true);
        setCountdown(60);
        setErrorGeneral('Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
      } else {
        // Mensaje de error, intentando ser compatible con ambas APIs
        const errorMessage = error.response?.data?.message || // Mensaje de la nueva API (ej. 'Email y contraseña son requeridos')
                               error.response?.data?.mensaje || // Mensaje de la API original (ej. 'Credenciales inválidas')
                               error.message || // Mensaje genérico de Axios si no hay respuesta del servidor
                               'Credenciales incorrectas'; // Mensaje por defecto
        setErrorGeneral(`${errorMessage}. Intentos restantes: ${3 - attempts}`);
      }
    } finally {
      setIsLoading(false); // Ocultar spinner de carga
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