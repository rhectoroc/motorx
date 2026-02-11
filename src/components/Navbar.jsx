import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import LanguageSelector from './LanguageSelector';
import OptimizedImage from './OptimizedImage';

function Navbar() {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-motorx-black border-b border-motorx-gray-800 sticky top-0 z-50 backdrop-blur-xl bg-motorx-black/90 relative shadow-2xl">
            {/* Gradient fade effect at bottom */}
            <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-motorx-black via-motorx-black/60 to-transparent pointer-events-none z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <OptimizedImage
                            src={logo}
                            alt="MotorX"
                            className="h-12 w-auto"
                            loading="eager"
                            fetchpriority="high"
                            width={48}
                            height={48}
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-motorx-white hover:text-motorx-red transition-colors">{t('nav.home')}</Link>
                        <Link to="/services" className="text-motorx-white hover:text-motorx-red transition-colors">{t('nav.services')}</Link>
                        <Link to="/contact" className="text-motorx-white hover:text-motorx-red transition-colors">{t('nav.contact')}</Link>
                    </div>

                    {/* Right Side: Language + Client Portal + Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-3">
                            <LanguageSelector />
                            {/* Client Portal Button - Icon Only */}
                            <a
                                href="https://dev.motorxcars.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center min-w-12 min-h-12 w-12 h-12 bg-gradient-red text-white rounded-lg shadow-glow-red hover:scale-105 transition-transform"
                                title="Client Portal"
                                aria-label="Acceder al Portal de Clientes"
                            >
                                <User className="h-5 w-5" />
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-motorx-white hover:text-motorx-red transition-colors min-w-12 min-h-12 flex items-center justify-center"
                            aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-motorx-black border-t border-motorx-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-motorx-white hover:text-motorx-red hover:bg-motorx-gray-900 text-center"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t('nav.home')}
                        </Link>
                        <Link
                            to="/services"
                            className="block px-3 py-2 rounded-md text-base font-medium text-motorx-white hover:text-motorx-red hover:bg-motorx-gray-900 text-center"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t('nav.services')}
                        </Link>
                        <Link
                            to="/contact"
                            className="block px-3 py-2 rounded-md text-base font-medium text-motorx-white hover:text-motorx-red hover:bg-motorx-gray-900 text-center"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t('nav.contact')}
                        </Link>

                        {/* Mobile Extras */}
                        <div className="mt-4 px-3 flex flex-col gap-4 sm:hidden">
                            <div className="flex justify-center">
                                <LanguageSelector />
                            </div>
                            <a
                                href="https://dev.motorxcars.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full h-12 bg-gradient-red text-white rounded-lg shadow-glow-red"
                                aria-label="Access Client Portal"
                            >
                                <User className="h-5 w-5 mr-2" /> Client Portal
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
