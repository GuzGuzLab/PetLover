import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';
import '../styles/RecuperarContraseña.css';
import { useForm } from 'react-hook-form';
import { BiShow, BiHide } from 'react-icons/bi';

function RecuperarContraseña() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [canResendCode, setCanResendCode] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResendCode(true);
    }
  }, [resendTimer]);

  const generateVerificationCode = () => {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleSendCode = (data) => {
    const code = generateVerificationCode();
    setVerificationCode(code);
    setEmail(data.email);
    setCanResendCode(false);
    setResendTimer(60);

    Swal.fire({
      title: 'Enviando...',
      text: 'Estamos enviando el código a tu correo',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    emailjs
      .send(
        'service_am5uvvi',
        'template_cqbpi3q',
        { email: data.email, passcode: code },
        'owZFiKlvc_X1nVtQ3'
      )
      .then(() => {
        Swal.close();
        Swal.fire({
          title: '<strong style="color:#2196f3;">Código Enviado</strong>',
          html: `
            <p>Revisa tu correo electrónico para continuar</p>
            <h2 style="font-size: 2rem; margin: 0.5rem 0; color: #2196f3;">✔</h2>
          `,
          showConfirmButton: false,
          timer: 2500,
          background: '#fff',
          icon: 'success'
        });
        setStep(2);
        reset();
      })
      .catch(() => {
        Swal.fire('Error', 'No se pudo enviar el correo', 'error');
      });
  };

  const handleResendCode = () => {
    if (!canResendCode) return;

    const code = generateVerificationCode();
    setVerificationCode(code);
    setCanResendCode(false);
    setResendTimer(60);

    emailjs.send(
      'service_am5uvvi',
      'template_cqbpi3q',
      { email, passcode: code },
      'owZFiKlvc_X1nVtQ3'
    ).then(
      () => Swal.fire({
        title: '<strong style="color:#2196f3;">Código Reenviado</strong>',
        html: '<p>Nuevo código enviado a tu correo</p><h2 style="font-size: 2rem; margin: 0.5rem 0; color: #2196f3;">🔁</h2>',
        showConfirmButton: false,
        timer: 2500,
        background: '#fff',
        icon: 'success'
      }),
      () => Swal.fire('Error', 'No se pudo enviar el correo', 'error')
    );
  };

  const handleVerifyCode = (data) => {
    const enteredCode = Object.keys(data)
      .filter(key => key.startsWith('code'))
      .map(key => data[key])
      .join('');

    if (enteredCode === verificationCode) {
      Swal.fire({
        title: '<strong style="color:#2196f3;">Código Verificado</strong>',
        html: `
          <p>Ahora puedes establecer tu nueva contraseña</p>
          <h2 style="font-size: 2rem; margin: 0.5rem 0; color: #2196f3;">🔓</h2>
        `,
        showConfirmButton: false,
        timer: 2500,
        background: '#fff',
        icon: 'success'
      });
      setStep(3);
      reset();
    } else {
      Swal.fire('Error', 'El código ingresado no es correcto', 'error');
    }
  };

  const handleResetPassword = async (data) => {
    try {
      console.log(data.password);
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword: data.password }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '<strong style="color:#4caf50;">¡Contraseña Actualizada!</strong>',
          html: `
            <p>Tu contraseña ha sido restablecida correctamente</p>
            <h2 style="font-size: 2rem; margin: 0.5rem 0; color: #4caf50;">✅</h2>
          `,
          showConfirmButton: false,
          timer: 2500,
          background: '#fff',
          icon: 'success'
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire('Error', result.message || 'Error al restablecer la contraseña', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Ocurrió un problema al conectar con el servidor', 'error');
    }
  };

  const getStepLabels = () => {
    return [
      { number: 1, label: 'Ingresa tu email' },
      { number: 2, label: 'Verifica el código' },
      { number: 3, label: 'Nueva contraseña' }
    ];
  };

  return (
    <main className="login-main">
      <div className="der-side">
        <div className="login-form">
          <h1 className="form-title">Recuperar Contraseña</h1>

          <div className="steps-container">
            <div className="steps-indicator">
              <div className="step-connector"></div>
              {getStepLabels().map((stepItem) => (
                <div key={stepItem.number} className="step-circle-wrapper">
                  <div
                    className={`step-circle ${
                      step > stepItem.number ? 'completed' :
                      step === stepItem.number ? 'active' : ''
                    }`}
                  >
                    {stepItem.number}
                  </div>
                  <div className="step-label">{stepItem.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Paso 1: Ingresar email */}
          {step === 1 && (
            <>
              <p className="form-subtitle">
                Ingresa el correo electrónico asociado a tu cuenta para recibir un código de verificación
              </p>
              <form onSubmit={handleSubmit(handleSendCode)}>
                <label>
                  Correo electrónico
                  <input
                    type="email"
                    {...register('email', {
                      required: 'El correo electrónico es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Ingresa un correo electrónico válido'
                      }
                    })}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </label>
                <button type="submit" className="btn-primary">
                  Enviar código
                </button>
              </form>
            </>
          )}

          {/* Paso 2: Verificar código */}
          {step === 2 && (
            <>
              <p className="form-subtitle">
                Hemos enviado un código de verificación a tu correo electrónico
              </p>
              <form onSubmit={handleSubmit(handleVerifyCode)}>
                <label>
                  Código de verificación
                  <div className="code-inputs">
                    {[...Array(6)].map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        {...register(`code${i}`, { required: true })}
                        className="code-input small-text"
                      />
                    ))}
                  </div>
                </label>
                <button type="submit" className="btn-primary">
                  Verificar código
                </button>
              </form>
              <div className="resend-container">
                {resendTimer > 0 ? (
                  <span className="resend-text disabled">
                    Puedes solicitar un nuevo código en {resendTimer} segundos
                  </span>
                ) : (
                  <span className="resend-text" onClick={handleResendCode}>
                    ¿No recibiste el código? Haz clic aquí para reenviar
                  </span>
                )}
              </div>
            </>
          )}

          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <>
              <p className="form-subtitle">
                Crea una nueva contraseña segura para tu cuenta
              </p>
              <form onSubmit={handleSubmit(handleResetPassword)}>
                <label>
                  Nueva contraseña
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'La contraseña es requerida',
                        minLength: {
                          value: 8,
                          message: 'La contraseña debe tener al menos 8 caracteres'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                          message: 'Debe incluir mayúsculas, minúsculas, números y caracteres especiales'
                        }
                      })}
                      className={errors.password ? 'input-error' : ''}
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <BiShow size={20} /> : <BiHide size={20} />}
                    </span>
                  </div>
                  {errors.password && <span className="error-message">{errors.password.message}</span>}
                </label>

                <label>
                  Confirmar contraseña
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Confirma tu contraseña',
                        validate: value =>
                          value === watch('password') || 'Las contraseñas no coinciden'
                      })}
                      className={errors.confirmPassword ? 'input-error' : ''}
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <BiShow size={20} /> : <BiHide size={20} />}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword.message}</span>
                  )}
                </label>

                <button type="submit" className="btn-primary btn-success">
                  Restablecer contraseña
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default RecuperarContraseña;

