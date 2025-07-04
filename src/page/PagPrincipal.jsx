import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/PagPrincipal.css";

const PagPrincipal = () => {
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  let currentSlide = 0;

 
  const animateCounters = () => {
    const counters = document.querySelectorAll(".stat-number");

    counters.forEach((counter) => {
      const targetText = counter.textContent;
      const target = parseInt(targetText.replace("+", ""));
      counter.textContent = "0";

      // Calcular el incremento por paso
      const duration = 2000; 
      const steps = 50; 
      const increment = target / steps;
      let current = 0;

  
      const timer = setInterval(() => {
        current += increment;

       
        if (current >= target) {
          counter.textContent = targetText; 
          clearInterval(timer);
        } else {
          counter.textContent =
            Math.floor(current) + (targetText.includes("+") ? "+" : "");
        }
      }, duration / steps);
    });
  };

  const showSlide = (index) => {
    if (!testimonialsRef.current) return;
    
    const slider = testimonialsRef.current;
    const slides = slider.querySelectorAll(".testimonial-card");
    const dots = document.querySelectorAll(".nav-dot");
    
    if (index >= slides.length) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = index;
    }
    
    slider.scrollTo({
      left: slides[currentSlide].offsetLeft - slider.offsetLeft,
      behavior: "smooth"
    });
    
 
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  };


  useEffect(() => {
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    const autoSlide = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);

    return () => {
      clearInterval(autoSlide);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pagprincipal">
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Bienvenido a Pet-Lovers</h1>
            <p>
              Medicina veterinaria especializada con el más alto nivel de
              cuidado y atención personalizada para tu mascota.
            </p>

            <div className="button-container">
              <Link to="/citas" className="button button-filled">
                Reservar cita ahora
              </Link>
              <Link to="/servicios" className="button button-outline">
                Conocer servicios
              </Link>
            </div>

            <div className="stats" ref={statsRef}>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-text">Años de experiencia</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5000+</div>
                <div className="stat-text">Mascotas atendidas</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-text">Compromiso</div>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img 
              src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/inicio.png" 
              alt="Veterinario con mascota" 
              className="main-image" 
            />
          </div>
        </div>

        <div className="wave-divider">
          <svg
            data-name="Layer 1"
            xmlns="https://www.freepik.es/icono/chat_5444434#fromView=family&page=1&position=27&uuid=94167461-9206-45fc-89c1-0aa9fc695fc2"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
          </svg>
        </div>
      </section>
      <section className="section services">
        <div className="container">
          <div className="section-title">
            <h2>Nuestros Servicios</h2>
            <p>
              Ofrecemos una amplia gama de servicios veterinarios para mantener
              a tu mascota saludable y feliz.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-img">
                <img
                  src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/consultag.png"
                  alt="Consulta Veterinaria"
                />
              </div>
              <div className="service-content">
                <h3 className="service-title">Consulta General</h3>
                <p className="service-description">
                  Evaluación completa de la salud de tu mascota con profesionales
                  experimentados.
                </p>
                <div className="service-link">
                  <Link to="/servicios">
                    Saber más 
                  </Link>
                </div>
              </div>
            </div>

            <div className="service-card">
              <div className="service-img">
                <img
                  src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/vacunacion.png"
                  alt="Vacunación"
                />
              </div>
              <div className="service-content">
                <h3 className="service-title">Vacunación</h3>
                <p className="service-description">
                  Protege a tu mascota contra enfermedades con nuestro programa
                  de vacunación personalizado.
                </p>
                <div className="service-link">
                  <Link to="/servicios">
                    Saber más 
                  </Link>
                </div>
              </div>
            </div>

            <div className="service-card">
              <div className="service-img">
                <img
                  src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/cirugia.png"
                  alt="Cirugía"
                />
              </div>
              <div className="service-content">
                <h3 className="service-title">Cirugía</h3>
                <p className="service-description">
                  Procedimientos quirúrgicos realizados con la máxima precisión y
                  cuidado por nuestros especialistas.
                </p>
                <div className="service-link">
                  <Link to="/servicios">
                    Saber más 
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="view-all-services text-center mt-4">
            <Link to="/servicios" className="btn btn-outline">
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>
      <section className="section about">
        <div className="container">
          <div className="about-container">
            <div className="about-image">
              <img
                src="https://img.freepik.com/fotos-premium/veterinaria-mujeres-alegres-sus-mascotas-concepto-veterinario_211139-3251.jpg?w=996"
                alt="Equipo Pet-lovers"
              />
              <div className="experience-badge">
                <span>10+</span>
                <span>años</span>
              </div>
            </div>

            <div className="about-content">
              <h2 className="about-title">Sobre Pet-Lovers</h2>
              <p className="about-description">
                Desde 2010, Pet-Lovers ha sido sinónimo de excelencia en medicina
                veterinaria. Nuestro equipo de profesionales altamente
                calificados está comprometido con brindar el mejor cuidado
                posible a cada mascota que nos visita.
              </p>
              <p className="about-description">
                Contamos con instalaciones modernas y equipamiento de última
                generación para garantizar diagnósticos precisos y tratamientos
                efectivos.
              </p>

              <div className="mission-values">
                <h3>Nuestra Misión</h3>
                <p>
                  Proporcionar atención veterinaria de la más alta calidad con
                  compasión y respeto, mejorando la vida de las mascotas y
                  fortaleciendo el vínculo con sus familias.
                </p>

                <div className="values-list">
                  <div className="value-item">Excelencia</div>
                  <div className="value-item">Compasión</div>
                  <div className="value-item">Integridad</div>
                  <div className="value-item">Innovación</div>
                  <div className="value-item">Educación</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Beneficios */}
      <section className="section benefits">
        <div className="container">
          <div className="section-title">
            <h2>¿Por qué elegir Pet-Lovers?</h2>
            <p>
              Descubre las razones por las que miles de familias confían en
              nosotros para el cuidado de sus mascotas.
            </p>
          </div>

          <div className="benefits-container">
            <div className="benefits-grid">
              {/* Beneficio 1 */}
              <div className="benefit-card">
                <div className="iconos">
                  <img src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/equipo.png" alt="grupo" />
                </div>
                <h3 className="benefit-title">Equipo Profesional</h3>
                <p className="benefit-description">
                  Veterinarios especializados con años de experiencia y
                  formación continua.
                </p>
              </div>

              <div className="benefit-card">
                <div className="iconos">
                  <img src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/atencion.png" alt="grupo" />
                </div>
                <h3 className="benefit-title">Atención Personalizada</h3>
                <p className="benefit-description">
                  Cada mascota recibe un plan de cuidado adaptado a sus
                  necesidades específicas.
                </p>
              </div>

              <div className="benefit-card">
                <div className="iconos">
                  <img src="https://raw.githubusercontent.com/Nore0729/Img-soft-veterinario/refs/heads/main/horario.png" alt="grupo" />
                </div>
                <h3 className="benefit-title">Horarios Flexibles</h3>
                <p className="benefit-description">
                  Amplia disponibilidad de horarios para adaptarnos a tu agenda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section testimonials">
        <div className="container">
          <div className="section-title">
            <h2>Lo que dicen nuestros clientes</h2>
            <p>
              Experiencias reales de familias que confían en Pet-lovers para el
              cuidado de sus mascotas.
            </p>
          </div>

          <div className="testimonials-container">
            <div className="testimonials-slider" ref={testimonialsRef}>
             
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "El equipo de Pet-lovers ha sido increíble con nuestro perro
                    Max. Su profesionalismo y cariño hacia los animales es
                    evidente en cada visita. Siempre nos sentimos en buenas
                    manos."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>Ana García</h4>
                      <p>Dueña de Max</p>
                      
                    </div>
                    <div className="pet-image">
                      <img
                        src="https://img.freepik.com/fotos-premium/perro-pomerania_1048944-12490801.jpg?w=740"
                        alt="Mascota 1"
                      />
                    </div>
                  </div>
                </div>
              </div>

      
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "Cuando mi gata Luna necesitó cirugía, estaba muy
                    preocupada. El Dr. Guzmán nos explicó todo el procedimiento
                    y nos mantuvo informados en cada paso. Ahora Luna está
                    perfectamente y no podríamos estar más agradecidos."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>Carlos Rodríguez</h4>
                      <p>Dueño de Luna</p>
                      
                    </div>
                    <div className="pet-image">
                      <img
                        src="https://img.freepik.com/psd-gratis/hermoso-gato-retrato-aislado_23-2150186058.jpg?t=st=1744170208~exp=1744173808~hmac=d9af37bcbce664edc207f8fe7d71200c681fbbff118179e3dd7dd4c8b15ea357&w=740"
                        alt="Mascota 2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "Llevamos a nuestro conejo Tambor a Pet-Lovers desde hace años.
                    Apreciamos mucho que tengan experiencia con mascotas
                    exóticas y siempre nos den los mejores consejos para su
                    cuidado."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>Laura Martínez</h4>
                      <p>Dueña de Tambor</p>
                      
                    </div>
                    <div className="pet-image">
                      <img
                        src="https://img.freepik.com/fotos-premium/conejo-curioso-blanco-negro_1002763-18.jpg?w=740"
                        alt="Mascota 3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "Mi loro Kiwi siempre recibe una atención espectacular en Pet-Lovers.
                    Me encanta cómo se toman el tiempo para entender sus necesidades especiales. ¡Altamente recomendados!"
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>David Guzman</h4>
                      <p>Dueño de Kiwi</p>
                      
                    </div>
                    <div className="pet-image">
                      <img
                        src="https://img.freepik.com/foto-gratis/loro-colorido-ramas-arbol_23-2147790036.jpg?w=740"
                        alt="Mascota 4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">
                    "Desde que llevo a mi hurón Max a Pet-Lovers, 
                    su salud ha mejorado notablemente. El equipo es muy profesional
                    y tienen mucho amor por los animales.."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>Felipe Nieves</h4>
                      <p>Dueño de Max</p>
                      
                    </div>
                    <div className="pet-image">
                      <img
                        src="https://img.freepik.com/foto-gratis/hermoso-huron-blanco-mirando-camara_23-2149219462.jpg?w=740"
                        alt="Mascota 5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-nav">
              <div className="nav-dot active" onClick={() => showSlide(0)}></div>
              <div className="nav-dot" onClick={() => showSlide(1)}></div>
              <div className="nav-dot" onClick={() => showSlide(2)}></div>
              <div className="nav-dot" onClick={() => showSlide(3)}></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section location">
        <div className="container">
          <div className="location-container">
            <div className="location-info">
              <h2 className="location-title">Horarios y Ubicación</h2>

              <div className="address-container">
                <div className="address-item">
                  <div className="address-icon">
                    
                  </div>
                  <div className="address-content">
                    <h4>Dirección</h4>
                    <p>Cl. 12 #9 -58, Soacha, Cundinamarca</p>
                  </div>
                </div>

                <div className="address-item">
                  <div className="address-icon">
                    
                  </div>
                  <div className="address-content">
                    <h4>Teléfono</h4>
                    <p>
                      <a href="tel:+123456789">+57 3214972944</a>
                    </p>
                  </div>
                </div>

                <div className="address-item">
                  <div className="address-icon">
                    
                  </div>
                  <div className="address-content">
                    <h4>Email</h4>
                    <p>
                      <a href="mailto:contacto@guzpet.com">
                        contacto@petlovers.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="hours-container">
                <h3 className="hours-title">
                  Horarios de Atención
                </h3>
                <ul className="hours-list">
                  <li className="hours-item">
                    <span className="day">Lunes - Viernes</span>
                    <span className="time">9:00 AM - 4:00 PM</span>
                  </li>
                  <li className="hours-item">
                    <span className="day">Sábado</span>
                    <span className="time">10:00 AM - 2:00 PM</span>
                  </li>
                  <li className="hours-item">
                    <span className="day">Domingo</span>
                    <span className="time">Cerrado</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="map-container">
            <iframe
              title="Ubicación Pet Lovers Spa Therapy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.007047573952!2d-74.2208567!3d4.5839607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9f1dbb5a9d83%3A0x66d22c859134dc43!2sPet%20Lovers%20Spa%20Therapy!5e0!3m2!1ses!2sco!4v1620000000000!5m2!1ses!2sco"
              allowFullScreen
              loading="lazy"
              className="map-iframe"
            ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section className="section contact">
        <div className="container">
          <div className="section-title">
            <h2>Contáctanos</h2>
            <p>
              Estamos aquí para responder tus preguntas y programar la atención
              que tu mascota necesita.
            </p>
          </div>

          <div className="contact-container">
            <div className="contact-info">
              <h3 className="contact-title">Información de Contacto</h3>
              <p className="contact-description">
                No dudes en comunicarte con nosotros para cualquier consulta o
                para agendar una cita. Nuestro equipo está listo para atenderte.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">
                    
                  </div>
                  <div className="contact-details">
                    <h4>Llámanos</h4>
                    <a href="tel:+3214972944">+57 3214972944</a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    
                  </div>
                  <div className="contact-details">
                    <h4>Escríbenos</h4>
                    <a href="mailto:contacto@guzpet.com">contacto@PetLovers.com</a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                  </div>
                  <div className="contact-details">
                    <h4>WhatsApp</h4>
                    <a href="https://wa.link/gfl7jn">+57 3214972944</a>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <a href="#" className="social-link">
                  
                </a>
                <a href="#" className="social-link">
                  
                </a>
                <a href="#" className="social-link">
                 
                </a>
                <a href="#" className="social-link">
                  
                </a>
              </div>
            </div>

            <div className="contact-form">
              <h3>Envíanos un mensaje</h3>
              <form>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nombre</label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Tu email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="Tu teléfono"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mensaje</label>
                  <textarea
                    id="message"
                    className="form-control"
                    placeholder="¿Cómo podemos ayudarte?"
                    required
                  ></textarea>
                </div>

                <div className="form-check">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    Acepto la política de privacidad y términos de servicio
                  </label>
                </div>

                <button type="submit" className="submit-btn">
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PagPrincipal;
