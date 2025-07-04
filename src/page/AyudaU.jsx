    "use client"

    import { useState } from "react"
    import "../styles/AyudaU.css"

    const HelpSection = () => {
    const [expandedCategory, setExpandedCategory] = useState(null)

    const toggleCategory = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category)
    }

    const helpCategories = [
        {
        id: "servicios",
        title: "Servicios Veterinarios",
        icon: "🏥",
        items: [
            "Consultas médicas generales",
            "Vacunación y desparasitación",
            "Cirugías menores y mayores",
            "Análisis clínicos y diagnósticos",
            "Medicina preventiva",
            "Atención de emergencias",
            "Hospitalización y cuidados intensivos",
        ],
        },
        {
        id: "estetica",
        title: "Estética y Cuidado",
        icon: "✂️",
        items: [
            "Baño y secado profesional",
            "Corte de pelo y estilizado",
            "Limpieza de oídos",
            "Corte de uñas",
            "Cepillado dental",
            "Tratamientos para la piel",
            "Deslanado especializado",
        ],
        },
        {
        id: "emergencias",
        title: "Emergencias",
        icon: "🚨",
        items: [
            "Atención 24/7 para emergencias críticas",
            "Primeros auxilios básicos",
            "Intoxicaciones y envenenamientos",
            "Traumatismos y accidentes",
            "Dificultades respiratorias",
            "Convulsiones",
            "Partos complicados",
        ],
        },
        {
        id: "cuidados",
        title: "Cuidados en Casa",
        icon: "❤️",
        items: [
            "Alimentación adecuada por edad",
            "Ejercicio y actividad física",
            "Higiene diaria básica",
            "Administración de medicamentos",
            "Cuidados post-operatorios",
            "Socialización de mascotas",
            "Prevención de parásitos",
        ],
        },
    ]

    return (
        <div className="help-section">
        {/* Header */}
        <div className="help-header">
            <div className="help-container">
            <h1 className="help-title">Centro de Ayuda</h1>
            <p className="help-subtitle">Veterinaria PetLovers</p>
            <p className="help-description">Encuentra toda la información que necesitas sobre nuestros servicios</p>
            </div>
        </div>

        <div className="help-container">
            {/* Información de Contacto */}
            <div className="contact-info">
            <h2 className="section-title">Información de Contacto</h2>
            <div className="contact-grid">
                <div className="contact-column">
                <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span className="contact-label">Teléfono:</span>
                    <span className="contact-value">(555) 123-4567</span>
                </div>
                <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <span className="contact-label">Email:</span>
                    <span className="contact-value">info@petlovers.com</span>
                </div>
                <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <div className="contact-address">
                    <span className="contact-label">Dirección:</span>
                    <p>Av. Principal 123, Ciudad, CP 12345</p>
                    </div>
                </div>
                </div>
                <div className="contact-column">
                <div className="contact-item">
                    <span className="contact-icon">🕒</span>
                    <div className="contact-schedule">
                    <span className="contact-label">Horarios de Atención:</span>
                    <div className="schedule-list">
                        <p>Lunes a Viernes: 8:00 AM - 8:00 PM</p>
                        <p>Sábados: 9:00 AM - 6:00 PM</p>
                        <p>Domingos: 10:00 AM - 4:00 PM</p>
                        <p className="emergency-hours">Emergencias: 24/7</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>

            {/* Categorías de Ayuda */}
            <div className="help-categories">
            <h2 className="categories-title">Categorías de Ayuda</h2>

            {helpCategories.map((category) => (
                <div key={category.id} className="category-card">
                <button onClick={() => toggleCategory(category.id)} className="category-header">
                    <div className="category-header-content">
                    <span className="category-icon">{category.icon}</span>
                    <h3 className="category-title">{category.title}</h3>
                    </div>
                    <span className={`chevron ${expandedCategory === category.id ? "expanded" : ""}`}>▼</span>
                </button>

                {expandedCategory === category.id && (
                    <div className="category-content">
                    <ul className="category-list">
                        {category.items.map((item, index) => (
                        <li key={index} className="category-item">
                            <span className="bullet">•</span>
                            <span>{item}</span>
                        </li>
                        ))}
                    </ul>
                    </div>
                )}
                </div>
            ))}
            </div>

            {/* Información Adicional */}
            <div className="additional-info">
            <div className="info-card">
                <h3 className="info-title">Políticas Importantes</h3>
                <ul className="info-list">
                <li>• Las consultas requieren presentar carnet de vacunación</li>
                <li>• Para emergencias, llamar antes de llegar</li>
                <li>• Los pagos se aceptan en efectivo y tarjeta</li>
                <li>• Se requiere identificación del propietario</li>
                <li>• Mantener a las mascotas con correa o transportador</li>
                </ul>
            </div>

            <div className="info-card">
                <h3 className="info-title">Consejos Generales</h3>
                <ul className="info-list">
                <li>• Mantén al día las vacunas de tu mascota</li>
                <li>• Programa revisiones preventivas cada 6 meses</li>
                <li>• Observa cambios en el comportamiento</li>
                <li>• Proporciona una dieta balanceada</li>
                <li>• Asegura ejercicio regular y adecuado</li>
                </ul>
            </div>
            </div>

            {/* Footer de la sección */}
            <div className="help-footer">
            <h3 className="footer-title">¿No encontraste lo que buscabas?</h3>
            <p className="footer-description">
                Nuestro equipo está disponible para ayudarte con cualquier pregunta adicional
            </p>
            <div className="footer-contact">
                <span className="footer-icon">📞</span>
                <span className="footer-phone">(555) 123-4567</span>
            </div>
            </div>
        </div>
        </div>
    )
    }

    export default HelpSection
