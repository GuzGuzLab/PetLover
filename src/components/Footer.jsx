import React from 'react';
import { Link } from 'react-router-dom'; 
import { FaFacebook } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { BsInstagram } from "react-icons/bs";
import '../styles/Footer.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-column">
                    <h3>Desarrolladores</h3>
                    <ul>
                        <li>
                            <li><a href="#">Ayda Alejandra Linares</a></li>
                            <li><a href="#">Yenifer Garcia Bermudez</a></li>
                            <li><a href="#">David Andres Guzman</a></li>
                            <li><a href="#">Andres Felipe Nieves</a></li>
                        </li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Síguenos</h3>
                    <ul>
                        <li>
                            <a href="https://wa.link/gfl7jn">
                              <BsWhatsapp />
                                Whatsapp
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <FaFacebook />
                                Facebook
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <BsInstagram />
                                Instagram
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Información</h3>
                    <ul>
                        <li><a href="#">Sobre nosotros</a></li>
                        <li><a href="/servicios">Servicios</a></li>
                        <li><a href="/PoliticasP">Política de privacidad</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>Contacto</h3>
                    <ul>
                        <li>Email:contacto@petlovers.com</li>
                        <li>Teléfono: +57 3214972645</li>
                        <li>Dirección: Soacha Cundinamarca</li>
                    </ul>
                </div>
               
            </div>
            <div className="footer-copyright">
                &copy; 2024 PET LOVERS. <Link to="/PoliticasP" className="policy-link">
                    Política de Privacidad
                </Link>
            </div>
        </footer>
    );
};

export default Footer;