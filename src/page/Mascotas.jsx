import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { PawPrint, User, AtSign, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios'; 
import '../styles/Mascotas.css';

function RegistroMascota() {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate(); 

  const {
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    trigger,
    setValue
  } = useForm({ mode: 'onChange' });

  const requiredFields = {
    1: ['documento', 'nombre', 'especie', 'raza', 'genero'],
    2: ['color', 'fechaNacimiento', 'peso', 'tamano', 'estadoReproductivo'],
    3: ['vacunado', 'observaciones']
  };

  useEffect(() => {
    let filledFields = 0;
    requiredFields[step].forEach(field => {
      const value = watch(field);
      if (value && value.toString().trim() !== '') {
        filledFields++;
      }
    });

    const baseProgress = (step - 1) * 33;
    const stepProgress = (filledFields / requiredFields[step].length) * 33;
    
    setProgress(Math.min(100, Math.round(baseProgress + stepProgress)));
  }, [watch(), step]);

  const nextStep = async () => {
    const isValid = await trigger(requiredFields[step]);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data) => {
    data.vacunado = data.vacunado === "Sí" ? true : false;

    // Renombrar campos para que coincidan con la base de datos
    data.doc_pro = data.documento;
    data.fecha_nac = data.fechaNacimiento;
    data.estado_reproductivo = data.estadoReproductivo;

    // Eliminar los campos originales que no existen en la DB
    delete data.documento;
    delete data.fechaNacimiento;
    delete data.estadoReproductivo;

    try {
      const response = await axios.post('/api/mascotas/registro', data);
      if (response.status === 201) {
        Swal.fire({
          title: '<strong>Registro exitoso!</strong>',
          html: `<i>La mascota <strong>${data.nombre}</strong> fue registrada</i>`,
          icon: 'success',
          timer: 3000,
          didClose: () => {
            // navigate('/ruta-opcional');
          }
        });
      }
    } catch (error) {
      Swal.fire({
        title: '<strong>Error!</strong>',
        html: `<i>No se pudo registrar la mascota. Intenta nuevamente.</i>`,
        icon: 'error',
        timer: 3000
      });
    }
  };

  return (
    <div className="registro-container">
      <div className="progress-tracker">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <span className="progress-text">{progress}% completado</span>
      </div>

      <header className="registro-header">
        <PawPrint className="icon-paw" />
        <h1>Registro de Mascota</h1>
        <p>Paso {step} de 3 - {step === 1 ? 'Información General' : step === 2 ? 'Datos Adicionales' : 'Seguridad'}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <fieldset className="form-section">
            <legend><User className="icon-legend" /> Información General</legend>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Documento del Propietario *</label>
              </div>
              <input
                type="text"
                maxLength={10}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                }}
                {...register("documento", {
                  required: "Campo obligatorio",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Solo números permitidos"
                  },
                  maxLength: {
                    value: 10,
                    message: "Máximo 10 caracteres"
                  }
                })}
                className={errors.documento ? 'error' : ''}
                placeholder="Número de documento del propietario"
              />
              {errors.documento && (
                <span className="error-message">{errors.documento.message}</span>
              )}
            </div>

            {["nombre", "especie", "raza"].map((field) => (
              <div key={field} className="input-group">
                <div className="label-container">
                  <User className="icon-small" />
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
                </div>
                <input
                  type="text"
                  maxLength={50}
                  onInput={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, '').slice(0, 50);
                    e.target.value = value;
                    setValue(field, value);
                  }}
                  {...register(field, {
                    required: "Campo obligatorio",
                    pattern: {
                      value: /^[A-ZÁÉÍÓÚÑ ]+$/,
                      message: "Solo letras mayúsculas permitidas"
                    },
                    minLength: {
                      value: 3,
                      message: "Mínimo 3 caracteres"
                    },
                    maxLength: {
                      value: 50,
                      message: "Máximo 50 caracteres"
                    }
                  })}
                  className={errors[field] ? 'error' : ''}
                  placeholder={`Escribe el ${field}`}
                />
                {errors[field] && (
                  <span className="error-message">{errors[field].message}</span>
                )}
              </div>
            ))}

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Género *</label>
              </div>
              <select
                {...register("genero", { required: "Campo obligatorio" })}
                className={errors.genero ? 'error' : ''}
              >
                <option value="">Seleccionar</option>
                <option value="Macho">MACHO</option>
                <option value="Hembra">HEMBRA</option>
              </select>
              {errors.genero && (
                <span className="error-message">{errors.genero.message}</span>
              )}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="form-section">
            <legend><AtSign className="icon-legend" /> Datos Adicionales</legend>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Color</label>
              </div>
              <input
                type="text"
                maxLength={30}
                onInput={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, '');
                  e.target.value = value;
                  setValue("color", value);
                }}
                {...register("color", {
                  required: "Campo obligatorio",
                  pattern: {
                    value: /^[A-ZÁÉÍÓÚÑ ]+$/,
                    message: "Solo letras mayúsculas permitidas"
                  },
                  minLength: {
                    value: 3,
                    message: "Mínimo 3 caracteres"
                  },
                  maxLength: {
                    value: 30,
                    message: "Máximo 30 caracteres"
                  }
                })}
                className={errors.color ? 'error' : ''}
                placeholder="Escribe el color de la mascota"
              />
              {errors.color && (
                <span className="error-message">{errors.color.message}</span>
              )}
            </div>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Fecha de Nacimiento</label>
              </div>
              <input
                type="date"
                {...register("fechaNacimiento", {
                  required: "Campo obligatorio"
                })}
                className={errors.fechaNacimiento ? 'error' : ''}
              />
              {errors.fechaNacimiento && (
                <span className="error-message">{errors.fechaNacimiento.message}</span>
              )}
            </div>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Peso (kg)</label>
              </div>
              <input
                type="text"
                inputMode="decimal"
                maxLength={3}
                onInput={(e) => {
                  let value = e.target.value.replace(/[^0-9.]/g, ''); 
                  const parts = value.split('.');
                  if (parts.length > 2) {
                    value = parts[0] + '.' + parts[1]; 
                  }
                  if (value.length > 3) {
                    value = value.slice(0, 3);
                  }
                  e.target.value = value;
                }}
                {...register("peso", {
                  required: "Campo obligatorio",
                  pattern: {
                    value: /^[0-9]{1,3}(\.[0-9]?)?$/,
                    message: "Máximo 3 números y 1 decimal"
                  }
                })}
                className={errors.peso ? 'error' : ''}
                placeholder="Ej: 12.5"
              />
              {errors.peso && (
                <span className="error-message">{errors.peso.message}</span>
              )}
            </div>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Tamaño</label>
              </div>
              <select
                {...register("tamano", { required: "Campo obligatorio" })}
                className={errors.tamano ? 'error' : ''}
              >
                <option value="">Seleccionar</option>
                <option value="Pequeño">PEQUEÑO</option>
                <option value="Mediano">MEDIANO</option>
                <option value="Grande">GRANDE</option>
              </select>
              {errors.tamano && (
                <span className="error-message">{errors.tamano.message}</span>
              )}
            </div>

            <div className="input-group">
              <div className="label-container">
                <User className="icon-small" />
                <label>Esterilizado</label>
              </div>
              <select
                {...register("estadoReproductivo", { required: "Campo obligatorio" })}
                className={errors.estadoReproductivo ? 'error' : ''}
              >
                <option value="">Seleccionar</option>
                <option value="Intacto">Intacto</option>
                <option value="Esterilizado">Esterilizado</option>
                <option value="Castrado">Castrado</option>
              </select>
              {errors.estadoReproductivo && (
                <span className="error-message">{errors.estadoReproductivo.message}</span>
              )}
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="form-section">
            <legend><Lock className="icon-legend" /> Seguridad</legend>

            <div className="input-group">
              <div className="label-container">
                <Lock className="icon-small" />
                <label>Vacunado</label>
              </div>
              <select
                {...register("vacunado", { required: "Campo obligatorio" })}
                className={errors.vacunado ? 'error' : ''}
              >
                <option value="">Seleccionar</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
              {errors.vacunado && (
                <span className="error-message">{errors.vacunado.message}</span>
              )}
            </div>

            <div className="input-group">
              <div className="label-container">
                <Lock className="icon-small" />
                <label>Observaciones</label>
              </div>
              <textarea
                {...register("observaciones", {
                  required: "Campo obligatorio",
                  onChange: (e) => {
                    const value = e.target.value;
                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                    setValue("observaciones", capitalized);
                  }
                })}
                rows={4}
                placeholder="Escribe cualquier observación adicional"
              />
              {errors.observaciones && (
                <span className="error-message">{errors.observaciones.message}</span>
              )}
            </div>
          </fieldset>
        )}

        <div className="form-navigation">
          {step > 1 && (
            <button type="button" className="nav-btn prev-btn" onClick={prevStep}>
              <ChevronLeft /> Anterior
            </button>
          )}
          {step < 3 && (
            <button type="button" className="nav-btn prev-btn" onClick={nextStep}>
              Siguiente <ChevronRight />
            </button>
          )}
          {step === 3 && (
            <button type="submit" className="btn-submit">
              Registrar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default RegistroMascota;

