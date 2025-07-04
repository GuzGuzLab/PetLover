import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Eye, EyeOff } from "lucide-react"
import { PawPrint, User, AtSign, Lock, ChevronRight, ChevronLeft, MapPin } from "lucide-react"
import axios from "axios"
import "../styles/Propietarios.css"

function RegistroPropietario() {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Estados para la dirección estructurada
  const [tipoVia, setTipoVia] = useState("")
  const [numeroVia, setNumeroVia] = useState("")
  const [letra1, setLetra1] = useState("")
  const [numero1, setNumero1] = useState("")
  const [numero2, setNumero2] = useState("")
  const [letra2, setLetra2] = useState("")
  const [tipoVivienda, setTipoVivienda] = useState("")
  const [numeroVivienda, setNumeroVivienda] = useState("")
  const [direccionCompleta, setDireccionCompleta] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm({ mode: "onChange" })

  const password = watch("password")
  const formValues = watch()

  const requiredFields = {
    1: ["tipo_Doc", "doc", "nombre", "fecha_Nac"],
    2: ["tel", "email", "direccion"],
    3: ["password", "confirmPassword", "terms"],
  }

  // Opciones para la dirección
  const tiposVia = [
    { value: "carrera", label: "Carrera" },
    { value: "calle", label: "Calle" },
    { value: "avenida", label: "Avenida" },
    { value: "diagonal", label: "Diagonal" },
    { value: "transversal", label: "Transversal" },
    { value: "circular", label: "Circular" },
    { value: "autopista", label: "Autopista" },
  ]

  const tiposVivienda = [
    { value: "casa", label: "Casa" },
    { value: "apartamento", label: "Apartamento" },
    { value: "local", label: "Local" },
    { value: "oficina", label: "Oficina" },
  ]

  // Funciones para manejar la dirección
  const handleNumeroChange = (value, setter) => {
    const numeroLimpio = value.replace(/[^0-9]/g, "")
    setter(numeroLimpio)
  }

  const handleLetraChange = (value, setter) => {
    const letraLimpia = value.replace(/[^A-Za-z]/g, "").toUpperCase()
    setter(letraLimpia.slice(0, 1))
  }

  // Construir dirección completa
  useEffect(() => {
    let direccion = ""

    if (tipoVia) {
      const tipoSeleccionado = tiposVia.find((t) => t.value === tipoVia)
      direccion += tipoSeleccionado?.label || ""
    }

    if (numeroVia) {
      direccion += ` ${numeroVia}`
    }

    if (letra1) {
      direccion += ` ${letra1}`
    }

    if (numero1) {
      direccion += ` # ${numero1}`
    }

    if (numero2) {
      direccion += ` - ${numero2}`
    }

    if (letra2) {
      direccion += ` ${letra2}`
    }

    if (tipoVivienda && numeroVivienda) {
      const viviendaSeleccionada = tiposVivienda.find((t) => t.value === tipoVivienda)
      direccion += `, ${viviendaSeleccionada?.label} ${numeroVivienda}`
    }

    setDireccionCompleta(direccion)
    // Actualizar el valor en react-hook-form
    setValue("direccion", direccion)
  }, [tipoVia, numeroVia, letra1, numero1, numero2, letra2, tipoVivienda, numeroVivienda, setValue])

  useEffect(() => {
    let filledFields = 0
    requiredFields[step].forEach((field) => {
      const value = formValues[field]
      if (value && value.toString().trim() !== "") {
        filledFields++
      }
    })

    const baseProgress = (step - 1) * 33
    const stepProgress = (filledFields / requiredFields[step].length) * 33

    setProgress(Math.min(100, Math.round(baseProgress + stepProgress)))
  }, [formValues, step])

  const validarEdad = (fecha) => {
    const hoy = new Date()
    const nacimiento = new Date(fecha)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad >= 18
  }

  const nextStep = async () => {
    const isValid = await trigger(requiredFields[step])
    if (isValid) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const onSubmit = async (data) => {
    const requestData = {
      tipo_Doc: data.tipo_Doc,
      doc: data.doc,
      nombre: data.nombre,
      fecha_Nac: data.fecha_Nac,
      tel: data.tel,
      email: data.email,
      direccion: data.direccion,
      password: data.password
    };
    try {
        const response = await axios.post("/api/propietarios/registro", requestData)
      if (response.status === 201)
        Swal.fire({
          title: "<strong>Registro exitoso!</strong>",
          html: `<i>El propietario <strong>${data.nombre}</strong> fue registrado</i>`,
          icon: "success",
          timer: 3000,
          didClose: () => {
            localStorage.setItem("nombre", data.nombre)
            localStorage.setItem("email", data.email)
            navigate("/UserWelcome")
          },
        })
    } catch (error) {
      Swal.fire({
        title: "<strong>Error!</strong>",
        html: `<i>No se pudo registrar al propietario. Intenta nuevamente.</i>`,
        icon: "error",
        timer: 3000,
      })
    }
  }

  return (
    <div className="registro-container">

    
      <div className="progress-tracker">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <span className="progress-text">{progress}% completado</span>
      </div>

      <header className="registro-header">
        <PawPrint className="icon-paw" />
        <h1>Registro de Propietario</h1>
        <p>
          Paso {step} de 3 - {step === 1 ? "Información Personal" : step === 2 ? "Contacto" : "Seguridad"}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <fieldset className="form-section">
            <legend>
              <User className="icon-legend" /> Información Personal
            </legend>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Tipo de Documento *</label>
              </div>
              <select
                {...register("tipo_Doc", { required: "Campo obligatorio" })}
                className={errors.tipo_Doc ? "error" : ""}
              >
                <option value="">Seleccionar</option>
                <option value="CC">Cédula</option>
                <option value="CE">Cédula Extranjería</option>
              </select>
              {errors.tipo_Doc&& <span className="error-message">{errors.tipo_Doc.message}</span>}
            </div>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Número de Documento *</label>
              </div>
              <input
                type="text"
                maxLength={12}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 12)
                }}
                {...register("doc", {
                  required: "Campo obligatorio",
                  minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  maxLength: { value: 12, message: "Máximo 12 caracteres" },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Solo números permitidos",
                  },
                })}
                className={errors.doc ? "error" : ""}
                placeholder="Escribe tu número de documento"
              />
              {errors.doc && <span className="error-message">{errors.doc.message}</span>}
            </div>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Nombre Completo *</label>
              </div>
              <input
                type="text"
                maxLength={50}
                {...register("nombre", {
                  required: "Campo obligatorio",
                  minLength: { value: 3, message: "Mínimo 3 caracteres" },
                  maxLength: { value: 50, message: "Máximo 50 caracteres" },
                  pattern: {
                    value: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/,
                    message: "Solo letras permitidas",
                  },
                })}
                className={errors.nombre ? "error" : ""}
                placeholder="Escribe tu nombre"
                onInput={(e) => {
                  let value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, "")
                  if (value.length > 50) value = value.slice(0, 50)
                  value = value.toUpperCase()
                  e.target.value = value
                  setValue("nombre", value)
                }}
              />
              {errors.nombre && <span className="error-message">{errors.nombre.message}</span>}
            </div>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Fecha de Nacimiento *</label>
              </div>
              <input
                type="date"
                {...register("fecha_Nac", {
                  required: "Campo obligatorio",
                  validate: (value) => validarEdad(value) || "Debes ser mayor de 18 años",
                })}
                className={errors.fecha_Nac ? "error" : ""}
              />
              {errors.fecha_Nac && <span className="error-message">{errors.fecha_Nac.message}</span>}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="form-section">
            <legend>
              <AtSign className="icon-legend" /> Información de Contacto
            </legend>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Teléfono *</label>
              </div>
              <input
                type="tel"
                maxLength={10}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10)
                }}
                {...register("tel", {
                  required: "Campo obligatorio",
                  minLength: { value: 10, message: "Mínimo 10 dígitos" },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Solo números permitidos",
                  },
                })}
                className={errors.tel ? "error" : ""}
                placeholder="Escribe tu teléfono"
              />
              {errors.tel && <span className="error-message">{errors.tel.message}</span>}
            </div>

            <div className="input-group">
              <div className="label-container">
                <AtSign className="icon-small" />
                <label>Correo Electrónico *</label>
              </div>
              <input
                type="email"
                {...register("email", {
                  required: "Campo obligatorio",
                  pattern: {
                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
                    message: "Correo no válido",
                  },
                })}
                className={errors.email ? "error" : ""}
                placeholder="tu@correo.com"
                onInput={(e) => {
                  const value = e.target.value.toLowerCase()
                  setValue("email", value)
                }}
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>

            {/* SECCIÓN DE DIRECCIÓN ESTRUCTURADA */}
            <div className="input-group direccion-estructurada">
              <div className="label-container">
                <MapPin className="icon-small" />
                <label>Dirección *</label>
              </div>

              {/* Campo oculto para react-hook-form */}
              <input
                type="hidden"
                {...register("direccion", {
                  required: "Campo obligatorio",
                  minLength: { value: 5, message: "Completa todos los campos de dirección" },
                })}
              />

              {/* Tipo de vía */}
              <div className="direccion-row">
                <select value={tipoVia} onChange={(e) => setTipoVia(e.target.value)} className="direccion-select">
                  <option value="">Tipo de vía</option>
                  {tiposVia.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={numeroVia}
                  onChange={(e) => handleNumeroChange(e.target.value, setNumeroVia)}
                  placeholder="Número"
                  maxLength={3}
                  className="direccion-input-small"
                />

                <input
                  type="text"
                  value={letra1}
                  onChange={(e) => handleLetraChange(e.target.value, setLetra1)}
                  placeholder="Letra"
                  maxLength={1}
                  className="direccion-input-tiny"
                />
              </div>

              {/* Números con guión */}
              <div className="direccion-row">
                <span className="direccion-label">#</span>
                <input
                  type="text"
                  value={numero1}
                  onChange={(e) => handleNumeroChange(e.target.value, setNumero1)}
                  placeholder="Número"
                  maxLength={3}
                  className="direccion-input-small"
                />
                <span className="direccion-label">-</span>
                <input
                  type="text"
                  value={numero2}
                  onChange={(e) => handleNumeroChange(e.target.value, setNumero2)}
                  placeholder="Número"
                  maxLength={3}
                  className="direccion-input-small"
                />
                <input
                  type="text"
                  value={letra2}
                  onChange={(e) => handleLetraChange(e.target.value, setLetra2)}
                  placeholder="Letra"
                  maxLength={1}
                  className="direccion-input-tiny"
                />
              </div>

              {/* Tipo de vivienda */}
              <div className="direccion-row">
                <select
                  value={tipoVivienda}
                  onChange={(e) => setTipoVivienda(e.target.value)}
                  className="direccion-select"
                >
                  <option value="">Tipo vivienda</option>
                  {tiposVivienda.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={numeroVivienda}
                  onChange={(e) => handleNumeroChange(e.target.value, setNumeroVivienda)}
                  placeholder="Número"
                  maxLength={4}
                  className="direccion-input-small"
                />
              </div>

              {/* Vista previa de dirección */}
              <div className="direccion-preview">
                <strong>Dirección:</strong> {direccionCompleta || "Completa los campos para ver la dirección"}
              </div>

              {errors.direccion && <span className="error-message">{errors.direccion.message}</span>}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="form-section">
            <legend>
              <Lock className="icon-legend" /> Seguridad
            </legend>

            {/* Campo Contraseña */}
            <div className="input-group">
              <div className="label-container">
                <Lock className="icon-small" />
                <label>Contraseña *</label>
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={12}
                  onInput={(e) => {
                    if (e.target.value.length > 12) {
                      e.target.value = e.target.value.slice(0, 12)
                    }
                  }}
                  {...register("password", {
                    required: "Campo obligatorio",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                    maxLength: { value: 12, message: "Máximo 12 caracteres" },
                    validate: (value) => {
                      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/
                      return regex.test(value) || "Debe contener mayúscula, minúscula, número y símbolo"
                    },
                  })}
                  className={errors.password ? "error" : ""}
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar/Ocultar contraseña"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="input-group">
              <div className="label-container">
                <Lock className="icon-small" />
                <label>Confirmar Contraseña *</label>
              </div>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  maxLength={12}
                  onInput={(e) => {
                    if (e.target.value.length > 12) {
                      e.target.value = e.target.value.slice(0, 12)
                    }
                  }}
                  {...register("confirmPassword", {
                    required: "Campo obligatorio",
                    validate: (value) => value === watch("password") || "Las contraseñas no coinciden",
                  })}
                  className={errors.confirmPassword ? "error" : ""}
                  placeholder="Confirmar contraseña"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Mostrar/Ocultar contraseña"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
            </div>

            {/* Checkbox términos */}
            <div className="input-group checkbox-group">
              <input
                type="checkbox"
                {...register("terms", { required: "Debes aceptar los términos" })}
                id="terms"
                className={errors.terms ? "error" : ""}
              />
              <label htmlFor="terms">Acepto los términos y condiciones *</label>
              {errors.terms && <span className="error-message">{errors.terms.message}</span>}
            </div>
          </fieldset>
        )}

        <div className="form-navigation">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="nav-btn prev-btn">
              <ChevronLeft size={18} /> Anterior
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={nextStep} className="nav-btn next-btn">
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button type="submit" className="submit-btn">
              Registrar Propietario
            </button>
          )}
        </div>

        <p className="login-link">
          ¿Ya tienes cuenta? <Link to="/UserLogin">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  )
}

export default RegistroPropietario
