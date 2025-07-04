"use client"

// Función mejorada para cerrar sesión con confirmación animada
export const logoutWithConfirmation = () => {
  // Crear modal personalizado con animaciones
  const createAnimatedModal = () => {
    return new Promise((resolve) => {
      // Crear overlay
      const overlay = document.createElement("div")
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(6, 182, 212, 0.1);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      `

      // Crear modal
      const modal = document.createElement("div")
      modal.style.cssText = `
        background: linear-gradient(135deg, #ffffff 0%, #f0fdff 100%);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 20px 40px rgba(6, 182, 212, 0.2);
        border: 1px solid rgba(6, 182, 212, 0.2);
        max-width: 400px;
        width: 90%;
        text-align: center;
        transform: scale(0.8) translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `

      // Contenido del modal
      modal.innerHTML = `
        <div style="margin-bottom: 24px;">
          <div style="
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            color: white;
            font-size: 24px;
          ">
            ⚠️
          </div>
          <h3 style="
            color: #0f766e;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            font-family: 'Segoe UI', sans-serif;
          ">
            Cerrar Sesión
          </h3>
          <p style="
            color: #0891b2;
            font-size: 16px;
            line-height: 1.5;
            margin: 0;
            font-family: 'Segoe UI', sans-serif;
          ">
            ¿Estás seguro de que deseas cerrar sesión?
          </p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="cancelBtn" style="
            background: linear-gradient(135deg, #f0fdff, #e0f7fa);
            color: #0f766e;
            border: 2px solid rgba(6, 182, 212, 0.2);
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', sans-serif;
          ">
            Cancelar
          </button>
          <button id="confirmBtn" style="
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', sans-serif;
          ">
            Cerrar Sesión
          </button>
        </div>
      `

      // Agregar eventos hover
      const cancelBtn = modal.querySelector("#cancelBtn")
      const confirmBtn = modal.querySelector("#confirmBtn")

      cancelBtn.addEventListener("mouseenter", () => {
        cancelBtn.style.transform = "scale(1.05)"
        cancelBtn.style.background = "linear-gradient(135deg, #e0f7fa, #b2ebf2)"
      })

      cancelBtn.addEventListener("mouseleave", () => {
        cancelBtn.style.transform = "scale(1)"
        cancelBtn.style.background = "linear-gradient(135deg, #f0fdff, #e0f7fa)"
      })

      confirmBtn.addEventListener("mouseenter", () => {
        confirmBtn.style.transform = "scale(1.05)"
        confirmBtn.style.background = "linear-gradient(135deg, #b91c1c, #991b1b)"
      })

      confirmBtn.addEventListener("mouseleave", () => {
        confirmBtn.style.transform = "scale(1)"
        confirmBtn.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)"
      })

      // Eventos de click
      cancelBtn.addEventListener("click", () => {
        closeModal(false)
      })

      confirmBtn.addEventListener("click", () => {
        closeModal(true)
      })

      // Función para cerrar modal
      const closeModal = (confirmed) => {
        overlay.style.opacity = "0"
        modal.style.transform = "scale(0.8) translateY(20px)"

        setTimeout(() => {
          document.body.removeChild(overlay)
          resolve(confirmed)
        }, 300)
      }

      // Agregar al DOM
      overlay.appendChild(modal)
      document.body.appendChild(overlay)

      // Animar entrada
      setTimeout(() => {
        overlay.style.opacity = "1"
        modal.style.transform = "scale(1) translateY(0)"
      }, 10)
    })
  }

  // Ejecutar modal y manejar respuesta
  createAnimatedModal().then((confirmed) => {
    if (confirmed) {
      // Limpiar localStorage
      localStorage.clear()
      sessionStorage.clear()

      // Mostrar mensaje de despedida
      showGoodbyeMessage()

      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    }
  })
}

// Función para mostrar mensaje de despedida
const showGoodbyeMessage = () => {
  const message = document.createElement("div")
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
    z-index: 10000;
    font-family: 'Segoe UI', sans-serif;
    font-weight: 600;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `
  message.textContent = "¡Hasta pronto! 👋"

  document.body.appendChild(message)

  setTimeout(() => {
    message.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    message.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(message)
    }, 300)
  }, 1200)
}

// Función para verificar autenticación
export const checkAuth = () => {
  const token = localStorage.getItem("authToken")
  const userEmail = localStorage.getItem("userEmail")

  if (!token || !userEmail) {
    window.location.href = "/"
    return false
  }

  return true
}

// Función para obtener datos del usuario
export const getUserData = () => {
  return {
    email: localStorage.getItem("userEmail"),
    name: localStorage.getItem("userName"),
    role: localStorage.getItem("userRole") || "veterinario",
  }
}

// Función para guardar datos de sesión
export const saveUserSession = (userData) => {
  localStorage.setItem("authToken", userData.token || "authenticated")
  localStorage.setItem("userEmail", userData.email)
  localStorage.setItem("userName", userData.name)
  localStorage.setItem("userRole", userData.role || "veterinario")
  localStorage.setItem("loginTime", new Date().toISOString())
}
