import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faCalendarAlt, faEye, faEyeSlash, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import AdminLayout from "../../layout/AdminLayout";
import "../../styles/Administrador/FormUsu.css";

export default function RegistroUsu() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo_Doc: "CC",
    doc: "",
    nombre: "",
    fecha_Nac: "",
    tel: "",
    email: "",
    direccion: "",
    password: "",
    showPassword: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState({
    show: false,
    message: "",
    userName: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    switch (name) {
      case "doc":
        processedValue = value.replace(/\D/g, "").slice(0, 15);
        break;
      case "nombre":
        processedValue = value
          .replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, "")
          .slice(0, 100)
          .toUpperCase();
        break;
      case "tel":
        processedValue = value.replace(/\D/g, "").slice(0, 15);
        break;
      case "email":
        processedValue = value.toLowerCase().slice(0, 100);
        break;
      case "direccion":
        processedValue = value.slice(0, 255).toUpperCase();
        break;
      case "password":
        processedValue = value.slice(0, 255);
        break;
      default:
        break;
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setFormData({
      ...formData,
      showPassword: !formData.showPassword,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!["CC", "CE", "PA"].includes(formData.tipo_Doc)) {
      newErrors.tipo_Doc = "Seleccione un tipo de documento válido";
    }
    if (!formData.doc) {
      newErrors.doc = "El número de documento es obligatorio";
    } else if (formData.doc.length < 6) {
      newErrors.doc = "El documento debe tener al menos 6 dígitos";
    }
    if (!formData.nombre) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.trim().length < 5) {
      newErrors.nombre = "El nombre debe tener al menos 5 caracteres";
    }
    if (!formData.fecha_Nac) {
      newErrors.fecha_Nac = "La fecha de nacimiento es obligatoria";
    } else {
      const birthDate = new Date(formData.fecha_Nac);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.fecha_Nac = "El usuario debe ser mayor de 18 años";
      }
    }
    if (!formData.tel) {
      newErrors.tel = "El teléfono es obligatorio";
    } else if (formData.tel.length < 10) {
      newErrors.tel = "El teléfono debe tener al menos 10 dígitos";
    }
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }
    if (!formData.direccion) {
      newErrors.direccion = "La dirección es obligatoria";
    } else if (formData.direccion.trim().length < 10) {
      newErrors.direccion = "La dirección debe tener al menos 10 caracteres";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = "La contraseña debe contener mayúscula, minúscula, número y símbolo";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: null }));
  
    try {
      const dataToSend = {
        tipo_Doc: formData.tipo_Doc,
        doc: formData.doc,
        nombre: formData.nombre,
        fecha_Nac: formData.fecha_Nac,
        tel: formData.tel,
        email: formData.email,
        direccion: formData.direccion,
        password: formData.password,
      };
  
      const res = await fetch("http://localhost:3000/api/admin/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.message || "Error al registrar el usuario");
      }
  
      // Mostrar mensaje de éxito
      setRegistrationSuccess({
        show: true,
        message: "¡REGISTRO EXITOSO!",
        userName: formData.nombre
      });
  
      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          tipo_Doc: "CC",
          doc: "",
          nombre: "",
          fecha_Nac: "",
          tel: "",
          email: "",
          direccion: "",
          password: "",
          showPassword: false,
        });
        setRegistrationSuccess({ show: false, message: "", userName: "" });
        navigate("/InicioAdmin");
      }, 3000);
  
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "No se pudo conectar con el servidor",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess.show) {
    return (
      <AdminLayout>
        <div className="admin-registration-success">
          <div className="admin-success-card">
            <FontAwesomeIcon icon={faCheckCircle} className="admin-success-icon" />
            <h2>{registrationSuccess.message}</h2>
            <p>El usuario <strong>{registrationSuccess.userName}</strong> se ha registrado correctamente.</p>
            <p>Serás redirigido automáticamente...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-registration-container">
        <h2 className="admin-registration-title">Registro de usuarios</h2>

        <form onSubmit={handleSubmit} className="admin-registration-form">
          {errors.submit && <div className="admin-form-error">{errors.submit}</div>}

          <div className="admin-form-row">
            <div className={`admin-form-field ${errors.tipo_Doc ? "has-error" : ""}`}>
              <label>Tipo de Documento *</label>
              <select
                name="tipo_Doc"
                value={formData.tipo_Doc}
                onChange={handleChange}
                className="admin-form-input"
                required
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
              {errors.tipo_Doc && <span className="admin-field-error">{errors.tipo_Doc}</span>}
            </div>

            <div className={`admin-form-field ${errors.doc ? "has-error" : ""}`}>
              <label>Número de Documento *</label>
              <input
                type="text"
                name="doc"
                value={formData.doc}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Ej: 1234567890"
                maxLength="15"
                required
              />
              {errors.doc && <span className="admin-field-error">{errors.doc}</span>}
            </div>
          </div>

          <div className={`admin-form-field ${errors.nombre ? "has-error" : ""}`}>
            <label>Nombre Completo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Ej: JUAN PÉREZ GARCÍA"
              required
            />
            {errors.nombre && <span className="admin-field-error">{errors.nombre}</span>}
          </div>

          <div className="admin-form-row">
            <div className={`admin-form-field ${errors.fecha_Nac ? "has-error" : ""}`}>
              <label>Fecha de Nacimiento *</label>
              <div className="admin-input-with-icon">
                <input
                  type="date"
                  name="fecha_Nac"
                  value={formData.fecha_Nac}
                  onChange={handleChange}
                  className="admin-form-input"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                  required
                />
                <FontAwesomeIcon icon={faCalendarAlt} className="admin-input-icon" />
              </div>
              {errors.fecha_Nac && <span className="admin-field-error">{errors.fecha_Nac}</span>}
            </div>

            <div className={`admin-form-field ${errors.tel ? "has-error" : ""}`}>
              <label>Teléfono *</label>
              <input
                type="tel"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Ej: 3001234567"
                maxLength="15"
                required
              />
              {errors.tel && <span className="admin-field-error">{errors.tel}</span>}
            </div>
          </div>

          <div className={`admin-form-field ${errors.email ? "has-error" : ""}`}>
            <label>Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Ej: ejemplo@dominio.com"
              required
            />
            {errors.email && <span className="admin-field-error">{errors.email}</span>}
          </div>

          <div className={`admin-form-field ${errors.direccion ? "has-error" : ""}`}>
            <label>Dirección de residencia *</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Ej: CALLE 100 # 10-20"
              required
            />
            {errors.direccion && <span className="admin-field-error">{errors.direccion}</span>}
          </div>

          <div className={`admin-form-field ${errors.password ? "has-error" : ""}`}>
            <label>Contraseña *</label>
            <div className="admin-password-field">
              <input
                type={formData.showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Mínimo 8 caracteres"
                required
              />
              <FontAwesomeIcon
                icon={formData.showPassword ? faEyeSlash : faEye}
                className="admin-password-toggle"
                onClick={togglePasswordVisibility}
              />
            </div>
            {errors.password && <span className="admin-field-error">{errors.password}</span>}
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-form-button admin-primary-button" disabled={isSubmitting}>
              <FontAwesomeIcon icon={faSave} />
              {isSubmitting ? "Registrando..." : "Registrar Usuario"}
            </button>

            <button type="button" className="admin-form-button admin-secondary-button" onClick={() => navigate("/InicioAdmin")}>
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}