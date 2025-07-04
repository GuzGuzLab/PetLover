import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PoliticasP.css';

const PoliticasP = () => {
    return (
        <section className="politicas-container">
            <div className="politicas-header">
                <h1 className="politicas-title">Acuerdos de nivel de servicio de PET lOVERS</h1>
            </div>
            
            <div className="politicas-card">
                <p className="politicas-text">
                    El propósito del presente documento es establecer el alcance, modalidad, tiempo de respuesta, 
                    priorización y el nivel de servicio de soporte y de gestión de requerimientos que Pet Lovers
                    se compromete a brindar a sus clientes.
                </p>
            </div>

            <div className="politicas-section">
                <h2 className="section-title">SOPORTE</h2>
                <div className="section-content">
                    <p>
                        Es el medio que Pet Lovers brinda a los clientes para la gestión de los problemas, 
                        inquietudes y fallas, relacionadas con aspectos específicos de manejo y operación 
                        de las aplicaciones adquiridas a la compañía.
                    </p>
                    <p>
                        Buscamos garantizar que los aplicativos funcionen de acuerdo a las especificaciones 
                        con que fueron desarrollados, las cuales se encuentran en actualización constante.
                    </p>
                    <p>
                        La gestión de las solicitudes de soporte abarca desde que se recibe la solicitud 
                        hasta que se emite respuesta dentro de los tiempos máximos establecidos.
                    </p>
                </div>
            </div>

            <div className="politicas-section">
                <h2 className="section-title">Lo que no incluye el servicio de soporte</h2>
                <div className="section-content warning">
                    <h3 className="subsection-title">Capacitación en los diferentes módulos</h3>
                    <p>
                        En el evento que el cliente tenga cambios de personal, es su responsabilidad 
                        garantizar que han recibido el entrenamiento en los módulos a operar.
                    </p>
                    <p>
                        Este entrenamiento es brindado como servicio adicional a través de:
                    </p>
                    <ul className="features-list">
                        <li>Capacitaciones con personal calificado</li>
                        <li>Videos tutoriales</li>
                        <li>Manuales digitales</li>
                        <li>Webinars mensuales</li>
                    </ul>

                    <h3 className="subsection-title">Consultoría en procesos</h3>
                    <p>
                        Si el cliente no tiene procesos documentados y establecidos, es su 
                        responsabilidad hacer el levantamiento y documentación de los mismos.
                    </p>
                    <p>
                        La implementación de nuestro sistema puede generar cambios en los procesos, 
                        siendo responsabilidad del cliente evaluar el impacto.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PoliticasP;